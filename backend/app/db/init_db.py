from typing import Dict, Any
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.models.template import Template
from app.core.security import get_password_hash

def init_db(db: Session) -> None:
    """Initialize the database with default data."""
    
    # Проверяем, есть ли уже администратор
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        # Создаем администратора
        admin = User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Administrator",
            is_superuser=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    
    # Добавляем профессиональные шаблоны для бизнес-приложений
    business_templates = [
        # Content Creation Templates
        {
            "name": "Executive Summary Generator",
            "description": "Create a comprehensive executive summary of a report or document that highlights key findings and strategic implications.",
            "is_public": True,
            "structure": {
                "report_content": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Paste your report or document content here",
                    "description": "The full content of the report or document to summarize"
                }
            },
            "content": "Create a comprehensive executive summary of the following [report/document/analysis] that highlights key findings, strategic implications, and recommended actions. Structure the summary with clear sections for background, methodology, results, and next steps. Limit to 500 words while preserving all critical insights.\n\n[Input content here]"
        },
        {
            "name": "Brand Voice Adapter",
            "description": "Transform content to match your brand voice with specific tone and style characteristics.",
            "is_public": True,
            "structure": {
                "content": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Paste content to transform",
                    "description": "Content to transform"
                },
                "brand_voice": {
                    "type": "text",
                    "required": True,
                    "placeholder": "professional/conversational/authoritative/innovative",
                    "description": "Describe your brand voice"
                },
                "tone": {
                    "type": "text",
                    "required": True,
                    "placeholder": "formal/informal",
                    "description": "Desired tone"
                },
                "values": {
                    "type": "text",
                    "required": True,
                    "placeholder": "values/benefits to emphasize",
                    "description": "Values or benefits to emphasize"
                },
                "audience": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Target audience description",
                    "description": "Description of target audience"
                }
            },
            "content": "Transform the following content to match our brand voice characterized by [professional/conversational/authoritative/innovative] language, [formal/informal] tone, and emphasis on [values/benefits]. Maintain all key information while optimizing engagement with our [target audience description].\n\n[Input content here]"
        },
        
        # Data Analysis Templates
        {
            "name": "Data Insights Extractor",
            "description": "Analyze datasets and extract key patterns, unexpected findings, and strategic recommendations.",
            "is_public": True,
            "structure": {
                "data": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Paste your dataset or description",
                    "description": "Dataset or description to analyze"
                }
            },
            "content": "Analyze the following dataset and provide:\n1. Three key patterns or trends\n2. Two unexpected findings \n3. One strategic business recommendation based on the data\n4. Potential limitations of this analysis\n\nPresent your response in a structured format suitable for business stakeholders without technical backgrounds.\n\n[Input data or description here]"
        },
        {
            "name": "Performance Dashboard Summary",
            "description": "Create interpretive analysis of sales, marketing, or operational metrics with performance comparisons and recommendations.",
            "is_public": True,
            "structure": {
                "metrics_type": {
                    "type": "text",
                    "required": True,
                    "placeholder": "sales/marketing/operational",
                    "description": "Type of metrics"
                },
                "metrics_data": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Paste metrics data here",
                    "description": "The actual metrics data"
                }
            },
            "content": "Create an interpretive analysis of these [sales/marketing/operational] metrics. Explain:\n- How current performance compares to targets and previous periods\n- Primary factors driving any significant changes\n- Specific actions to address underperforming areas\n- Opportunities to capitalize on positive trends\n\nFocus on business impact rather than technical details.\n\n[Input metrics here]"
        },
        
        # Strategic Planning Templates
        {
            "name": "Competitive Analysis Framework",
            "description": "Develop a structured competitive analysis comparing your position relative to competitors across key dimensions.",
            "is_public": True,
            "structure": {
                "company_info": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Your company info",
                    "description": "Information about your company"
                },
                "competitor_1": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Competitor 1 name",
                    "description": "First competitor name"
                },
                "competitor_2": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Competitor 2 name",
                    "description": "Second competitor name"
                },
                "competitor_3": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Competitor 3 name",
                    "description": "Third competitor name"
                },
                "market_context": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Market context information",
                    "description": "Information about the market context"
                }
            },
            "content": "Develop a structured competitive analysis examining our position relative to [Competitor 1], [Competitor 2], and [Competitor 3] across these dimensions:\n- Product/service offerings\n- Pricing strategy\n- Market positioning\n- Customer experience\n- Technological capabilities\n- Growth trajectory\n\nFor each area, identify our comparative advantages, disadvantages, and opportunities for differentiation.\n\n[Input company and market context here]"
        },
        {
            "name": "Strategic Initiative Evaluator",
            "description": "Evaluate proposed initiatives or projects using a comprehensive analytical framework.",
            "is_public": True,
            "structure": {
                "initiative_type": {
                    "type": "text",
                    "required": True,
                    "placeholder": "initiative/project",
                    "description": "Type of initiative or project"
                },
                "initiative_details": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Details of the initiative",
                    "description": "Detailed description of the initiative"
                }
            },
            "content": "Evaluate the proposed [initiative/project] using the following analytical framework:\n- Alignment with organizational objectives\n- Required resources and investment\n- Potential risks and mitigation strategies\n- Expected outcomes and success metrics\n- Implementation timeline and key milestones\n- Impact on existing operations\n\nProvide balanced assessment highlighting both strengths and concerns.\n\n[Input initiative details here]"
        },
        
        # Customer Experience Templates
        {
            "name": "Voice of Customer Synthesizer",
            "description": "Analyze customer feedback to identify common themes, sentiment trends, and actionable recommendations.",
            "is_public": True,
            "structure": {
                "feedback_source": {
                    "type": "text",
                    "required": True,
                    "placeholder": "surveys/reviews/support interactions",
                    "description": "Source of customer feedback"
                },
                "feedback_data": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Paste customer feedback data",
                    "description": "Customer feedback data to analyze"
                }
            },
            "content": "Analyze these customer feedback inputs from [surveys/reviews/support interactions] and synthesize:\n- Common themes and recurring issues\n- Sentiment trends across different customer segments\n- Specific pain points requiring immediate attention\n- Positive elements to maintain or enhance\n- Actionable recommendations prioritized by impact and feasibility\n\nPresent findings in a format appropriate for cross-functional review.\n\n[Input customer feedback here]"
        },
        {
            "name": "Customer Journey Mapper",
            "description": "Map the customer journey for your product or service from initial awareness through post-purchase support.",
            "is_public": True,
            "structure": {
                "product_type": {
                    "type": "text",
                    "required": True,
                    "placeholder": "product/service",
                    "description": "Type of product or service"
                },
                "product_details": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Product or service details",
                    "description": "Detailed description of the product or service"
                }
            },
            "content": "Map the customer journey for our [product/service] from initial awareness through post-purchase support. For each stage:\n- Identify customer goals and expectations\n- Highlight key touchpoints and interactions\n- Assess emotional states and potential friction points\n- Suggest improvements to enhance experience quality\n- Propose metrics to measure effectiveness\n\nFocus on creating a coherent, seamless experience aligned with our brand promise.\n\n[Input product/service details here]"
        }
    ]
    
    # Проверяем, не существуют ли уже шаблоны с такими именами
    for template_data in business_templates:
        existing_template = db.query(Template).filter(Template.name == template_data["name"]).first()
        if not existing_template:
            # Конвертируем структуру в правильный формат для БД
            structure_dict = {}
            for key, value in template_data["structure"].items():
                structure_dict[key] = value
            
            # Создаем новый шаблон
            template = Template(
                name=template_data["name"],
                description=template_data["description"],
                structure=structure_dict,
                is_public=template_data["is_public"],
                user_id=admin.id
            )
            db.add(template)
    
    # Сохраняем изменения в БД
    db.commit() 