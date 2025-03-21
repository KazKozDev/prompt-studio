from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.db.models.template import Template, TemplateCategory
from app.schemas.template import TemplateCreate, TemplateUpdate, TemplateCategoryCreate

class CRUDTemplate(CRUDBase[Template, TemplateCreate, TemplateUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[Template]:
        return db.query(Template).filter(Template.name == name).first()
    
    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Template]:
        return (
            db.query(self.model)
            .filter(Template.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_public_templates(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Template]:
        return (
            db.query(self.model)
            .filter(Template.is_public == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_with_categories(
        self, db: Session, *, obj_in: TemplateCreate, category_ids: List[int] = None
    ) -> Template:
        db_obj = Template(
            name=obj_in.name,
            description=obj_in.description,
            structure=obj_in.structure,
            is_public=obj_in.is_public,
            user_id=obj_in.user_id
        )
        if category_ids:
            categories = db.query(TemplateCategory).filter(TemplateCategory.id.in_(category_ids)).all()
            db_obj.categories = categories
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_with_categories(
        self, db: Session, *, db_obj: Template, obj_in: TemplateUpdate, category_ids: List[int] = None
    ) -> Template:
        update_data = obj_in.dict(exclude_unset=True)
        if category_ids is not None:
            categories = db.query(TemplateCategory).filter(TemplateCategory.id.in_(category_ids)).all()
            db_obj.categories = categories
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

template = CRUDTemplate(Template) 