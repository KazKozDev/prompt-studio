from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from app.db.models.prompt import Prompt, PromptVersion
from app.schemas.prompt import PromptCreate, PromptUpdate, PromptVersionCreate
from datetime import datetime

class PromptService:
    @staticmethod
    def get(db: Session, prompt_id: int) -> Optional[Prompt]:
        return db.query(Prompt).filter(Prompt.id == prompt_id).first()
    
    @staticmethod
    def get_multi(
        db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Prompt]:
        return db.query(Prompt).filter(Prompt.user_id == user_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_total_count(db: Session, *, user_id: int) -> int:
        return db.query(Prompt).filter(Prompt.user_id == user_id).count()
    
    @staticmethod
    def create(db: Session, *, obj_in: PromptCreate, user_id: int) -> Prompt:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = Prompt(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        
        # Create initial version
        initial_version = PromptVersion(
            prompt_id=db_obj.id,
            version_number=1,
            content=db_obj.content,
            commit_message="Initial version",
            user_id=user_id
        )
        db.add(initial_version)
        db.commit()
        
        return db_obj
    
    @staticmethod
    def update(
        db: Session, *, db_obj: Prompt, obj_in: Union[PromptUpdate, Dict[str, Any]]
    ) -> Prompt:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        # Create a new version if requested
        create_version = update_data.pop("create_version", False)
        version_commit_message = update_data.pop("version_commit_message", None)
        
        if create_version and "content" in update_data:
            # Get the latest version number
            latest_version = db.query(PromptVersion).filter(
                PromptVersion.prompt_id == db_obj.id
            ).order_by(PromptVersion.version_number.desc()).first()
            
            next_version = 1
            if latest_version:
                next_version = latest_version.version_number + 1
            
            # Create a new version
            new_version = PromptVersion(
                prompt_id=db_obj.id,
                version_number=next_version,
                content=update_data["content"],
                commit_message=version_commit_message or f"Version {next_version}",
                user_id=db_obj.user_id
            )
            db.add(new_version)
            
            # Update prompt version number
            update_data["version"] = next_version
        
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    @staticmethod
    def delete(db: Session, *, prompt_id: int) -> Prompt:
        obj = db.query(Prompt).get(prompt_id)
        db.delete(obj)
        db.commit()
        return obj
    
    @staticmethod
    def get_versions(db: Session, *, prompt_id: int) -> List[PromptVersion]:
        return db.query(PromptVersion).filter(PromptVersion.prompt_id == prompt_id).order_by(PromptVersion.version_number.desc()).all()
    
    @staticmethod
    def get_version(db: Session, *, prompt_id: int, version_id: int) -> Optional[PromptVersion]:
        return db.query(PromptVersion).filter(
            PromptVersion.prompt_id == prompt_id,
            PromptVersion.id == version_id
        ).first()
    
    @staticmethod
    def get_version_by_number(db: Session, prompt_id: int, version_number: int) -> Optional[PromptVersion]:
        return db.query(PromptVersion).filter(
            PromptVersion.prompt_id == prompt_id,
            PromptVersion.version_number == version_number
        ).first()
    
    @staticmethod
    def create_version(
        db: Session, *, prompt_id: int, obj_in: PromptVersionCreate, user_id: int
    ) -> PromptVersion:
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        if not prompt:
            return None
        
        # Get the latest version number
        latest_version = db.query(PromptVersion).filter(
            PromptVersion.prompt_id == prompt_id
        ).order_by(PromptVersion.version_number.desc()).first()
        
        next_version = 1
        if latest_version:
            next_version = latest_version.version_number + 1
        
        # Create a new version
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = PromptVersion(
            prompt_id=prompt_id,
            version_number=next_version,
            user_id=user_id,
            **obj_in_data
        )
        
        # Update the prompt's content and version
        prompt.content = obj_in_data["content"]
        prompt.version = next_version
        prompt.updated_at = datetime.now()
        
        db.add(db_obj)
        db.add(prompt)
        db.commit()
        db.refresh(db_obj)
        
        return db_obj
    
    @staticmethod
    def revert_to_version(db: Session, prompt_id: int, version_id: int, user_id: int):
        # Get the prompt and target version
        prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        target_version = db.query(PromptVersion).filter(
            PromptVersion.prompt_id == prompt_id,
            PromptVersion.id == version_id
        ).first()
        
        if not prompt or not target_version:
            return None
        
        # Get the latest version number
        latest_version = db.query(PromptVersion).filter(
            PromptVersion.prompt_id == prompt_id
        ).order_by(PromptVersion.version_number.desc()).first()
        
        next_version = latest_version.version_number + 1
        
        # Create a new version based on the target version
        new_version = PromptVersion(
            prompt_id=prompt_id,
            version_number=next_version,
            content=target_version.content,
            commit_message=f"Reverted to version {target_version.version_number}",
            user_id=user_id
        )
        
        # Update the prompt
        prompt.content = target_version.content
        prompt.version = next_version
        prompt.updated_at = datetime.now()
        
        db.add(new_version)
        db.add(prompt)
        db.commit()
        db.refresh(new_version)
        
        return new_version
