from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.db.models.user import User
from app.db.models.template import Template as TemplateModel
from app.schemas.template import Template, TemplateList, TemplateCreate, TemplateUpdate

router = APIRouter()

@router.get("/", response_model=TemplateList)
def get_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get all templates available to the user."""
    # Получаем шаблоны пользователя
    templates = db.query(TemplateModel).filter(
        TemplateModel.user_id == current_user.id
    ).all()
    
    return {"templates": templates, "total": len(templates)}

@router.get("/public", response_model=TemplateList)
def get_public_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get all public templates created by other users."""
    # Получаем публичные шаблоны других пользователей
    templates = db.query(TemplateModel).filter(
        TemplateModel.is_public == True,
        TemplateModel.user_id != current_user.id  # Исключаем шаблоны текущего пользователя
    ).all()
    
    return {"templates": templates, "total": len(templates)}

@router.post("/", response_model=Template)
def create_template(
    *,
    db: Session = Depends(get_db),
    template_in: TemplateCreate = Body(...),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Create a new template."""
    # Преобразуем Pydantic модели в словари для безопасной сериализации в JSON
    structure_dict = {}
    for key, element in template_in.structure.items():
        if hasattr(element, "model_dump"):  # Pydantic v2
            structure_dict[key] = element.model_dump()
        elif hasattr(element, "dict"):      # Pydantic v1
            structure_dict[key] = element.dict()
        else:
            # Fallback для нестандартных объектов
            structure_dict[key] = {
                "type": element.type,
                "required": element.required,
                "default_value": element.default_value,
                "placeholder": element.placeholder,
                "description": element.description,
                "constraints": element.constraints
            }
    
    # Создаем новый шаблон с безопасной структурой
    db_template = TemplateModel(
        name=template_in.name,
        description=template_in.description,
        structure=structure_dict,  # Используем преобразованную структуру
        is_public=template_in.is_public,
        user_id=current_user.id
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.get("/{template_id}", response_model=Template)
def get_template(
    *,
    db: Session = Depends(get_db),
    template_id: int = Path(...),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get a specific template by ID."""
    template = db.query(TemplateModel).filter(TemplateModel.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Проверяем права доступа: шаблон должен быть публичным или принадлежать пользователю
    if template.user_id != current_user.id and not template.is_public:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return template

@router.put("/{template_id}", response_model=Template)
def update_template(
    *,
    db: Session = Depends(get_db),
    template_id: int = Path(...),
    template_in: TemplateUpdate = Body(...),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Update a template."""
    template = db.query(TemplateModel).filter(TemplateModel.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Проверяем права доступа: только владелец может редактировать шаблон
    if template.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Обновляем поля шаблона
    update_data = template_in.dict(exclude_unset=True)
    
    # Если в update_data есть поле structure, преобразуем его из Pydantic в словари
    if 'structure' in update_data and update_data['structure']:
        structure_dict = {}
        for key, element in update_data['structure'].items():
            if hasattr(element, "model_dump"):  # Pydantic v2
                structure_dict[key] = element.model_dump()
            elif hasattr(element, "dict"):      # Pydantic v1
                structure_dict[key] = element.dict()
            else:
                # Fallback для нестандартных объектов
                structure_dict[key] = {
                    "type": element.type,
                    "required": element.required,
                    "default_value": element.default_value,
                    "placeholder": element.placeholder,
                    "description": element.description,
                    "constraints": element.constraints
                }
        update_data['structure'] = structure_dict
    
    for field, value in update_data.items():
        setattr(template, field, value)
    
    db.add(template)
    db.commit()
    db.refresh(template)
    return template

@router.delete("/{template_id}", response_model=Template)
def delete_template(
    *,
    db: Session = Depends(get_db),
    template_id: int = Path(...),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Delete a template."""
    template = db.query(TemplateModel).filter(TemplateModel.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Проверяем права доступа: только владелец может удалить шаблон
    if template.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(template)
    db.commit()
    return template
