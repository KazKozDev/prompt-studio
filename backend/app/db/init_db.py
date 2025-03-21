from typing import Dict, Any
import logging
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.models.template import Template
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    
    # Delete all existing public templates
    db.query(Template).filter(Template.is_public == True).delete()
    logger.info("Deleted all existing public templates")
    
    # Create new templates
    templates = [
        # Chain-of-Thought
        {
            "name": "1. Chain-of-Thought",
            "description": "When developing a strategy, ask the model to explain step by step how to approach the problem.\n\nAdvantage: Reveals logical reasoning and provides a detailed action plan.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Let's think step by step: first analyze the current advertising expenses, then suggest three budget optimization options, and determine which one could increase conversion by 10%. Explain why the chosen option is the most effective.",
                    "placeholder": "Example: Let's think step by step: first analyze the current advertising expenses...",
                    "description": "A Chain-of-Thought prompt that asks the model to explain reasoning step by step"
                },
                "your_prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your Chain-of-Thought prompt here",
                    "description": "Your custom prompt using Chain-of-Thought technique"
                }
            }
        },
        
        # Zero-shot CoT with Trigger Phrase
        {
            "name": "2. Zero-shot CoT with Trigger Phrase",
            "description": "Add a trigger phrase to your request to activate detailed reasoning from the model.\n\nAdvantage: Provides a structured response without requiring training examples.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Let's think step by step: how can we improve the sales department's efficiency considering current metrics and budget constraints?",
                    "placeholder": "Example: Let's think step by step: how can we improve...",
                    "description": "A Zero-shot Chain-of-Thought prompt with trigger phrase"
                },
                "your_prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your Zero-shot CoT prompt here",
                    "description": "Your custom prompt using Zero-shot CoT technique"
                }
            }
        },
        
        # Few-shot Prompting
        {
            "name": "3. Few-shot Prompting",
            "description": "Provide examples of successful outcomes so the model understands the format and style of the response.\n\nAdvantage: The model produces ideas similar to the provided examples, increasing relevance.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Here are two examples of successful B2B sector advertisements:\nExample 1: 'Increase sales with our CRM – get a free consultation today.'\nExample 2: 'Optimize business processes – implement our automated solutions and reduce costs by 20%.'\nNow suggest 5 ad variations for promoting a new SaaS product, maintaining a concise style and targeting professionals.",
                    "placeholder": "Example: Here are two examples of successful B2B sector advertisements...",
                    "description": "A Few-shot prompt that includes examples for the model to follow"
                },
                "your_prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your Few-shot prompt here",
                    "description": "Your custom prompt using Few-shot technique"
                }
            }
        },
        
        # Prompt Chaining
        {
            "name": "4. Prompt Chaining",
            "description": "Break down complex tasks into several sequential stages.\n\nAdvantage: Allows for detailed elaboration of each stage and increases the accuracy of the final plan.",
            "is_public": True,
            "structure": {
                "example_chain": {
                    "type": "text",
                    "required": False,
                    "default_value": "Prompt 1: \"Create a brief market analysis for our e-commerce company, highlighting the main trends over the past year.\"\nPrompt 2: \"Based on the analysis, suggest audience segmentation by age, interests, and geography.\"\nPrompt 3: \"Develop a detailed advertising campaign plan for each segment, specifying key messages and promotion channels.\"",
                    "placeholder": "Example prompt chain...",
                    "description": "Example of a prompt chain with multiple steps"
                },
                "prompt_1": {
                    "type": "text",
                    "required": True,
                    "placeholder": "First prompt in your chain",
                    "description": "The first step in your prompt chain"
                },
                "prompt_2": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Second prompt in your chain",
                    "description": "The second step in your prompt chain"
                },
                "prompt_3": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Third prompt in your chain",
                    "description": "The third step in your prompt chain"
                }
            }
        },
        
        # Self-consistency Prompting
        {
            "name": "5. Self-consistency Prompting",
            "description": "Ask the same query multiple times and compare the results to select the optimal solution.\n\nAdvantage: Allows aggregation of results to select the most robust and logically justified option.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Suggest three strategies to improve operational efficiency in logistics for a company with 500 orders per day. Provide a brief analysis of each option.",
                    "placeholder": "Example: Suggest three strategies to improve operational efficiency...",
                    "description": "A Self-consistency prompt example"
                },
                "your_prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your Self-consistency prompt here",
                    "description": "Your custom prompt for generating multiple solutions to compare"
                }
            }
        },
        
        # Interactive Prompting
        {
            "name": "6. Interactive Prompting",
            "description": "Conduct a dialogue with the model for iterative refinement of the business task.\n\nAdvantage: Gradual refinement enables more precise action plans.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Describe the key issues our sales department is experiencing. (After receiving the answer:) Clarify which of these problems are most critical, and suggest solutions.",
                    "placeholder": "Example: Describe the key issues our sales department is experiencing...",
                    "description": "An Interactive prompting dialogue example"
                },
                "initial_prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Initial question or prompt",
                    "description": "The first question in your interactive dialogue"
                },
                "follow_up_prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Follow-up question after receiving initial response",
                    "description": "The follow-up question to refine the model's response"
                }
            }
        },
        
        # Role-based Prompting
        {
            "name": "7. Role-based Prompting",
            "description": "Specify that the model should play the role of an expert in a specific field.\n\nAdvantage: The model adapts the response according to the assigned professional role, making it more specialized.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "You are an experienced business consultant with 15 years of expertise in business process optimization. Analyze the current sales metrics and suggest 3 strategies to increase conversion, based on digital marketing principles.",
                    "placeholder": "Example: You are an experienced business consultant with 15 years of expertise...",
                    "description": "A Role-based prompt example"
                },
                "expert_role": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Specify the expert role (e.g., financial analyst, marketing expert)",
                    "description": "The specific expert role for the model to assume"
                },
                "task_description": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Describe the task for the expert",
                    "description": "The specific task or analysis for the expert role to perform"
                }
            }
        },
        
        # Meta-prompting
        {
            "name": "8. Meta-prompting",
            "description": "Allow the model to improve your request to make it more detailed.\n\nAdvantage: Automatically generates a more detailed and structured request, improving response quality.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Based on the following brief request: 'Develop a strategy to increase sales,' generate a detailed prompt that includes target audience analysis, key metrics, and recommendations for promotion channels.",
                    "placeholder": "Example: Based on the following brief request: 'Develop a strategy to increase sales,'...",
                    "description": "A Meta-prompting example"
                },
                "brief_request": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your brief initial request",
                    "description": "The brief request you want to expand into a detailed prompt"
                },
                "desired_elements": {
                    "type": "text",
                    "required": True,
                    "placeholder": "List elements to include in the expanded prompt",
                    "description": "Specific elements to include in the expanded prompt"
                }
            }
        },
        
        # Ask-before-answer Prompting
        {
            "name": "9. Ask-before-answer Prompting",
            "description": "Ask the model to pose clarifying questions before formulating the final answer.\n\nAdvantage: Clarifying all task parameters helps obtain the most accurate and relevant response.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Before suggesting a strategy for business process optimization, ask clarifying questions about current efficiency metrics, budget, and key pain points of the company.",
                    "placeholder": "Example: Before suggesting a strategy for business process optimization...",
                    "description": "An Ask-before-answer prompt example"
                },
                "your_prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your prompt here",
                    "description": "Your custom prompt that asks for clarifying questions"
                }
            }
        },
        
        # Constructive Criticism Prompting
        {
            "name": "10. Constructive Criticism Prompting",
            "description": "Ask the model to evaluate and suggest improvements for a business plan or strategy.\n\nAdvantage: Helps identify potential weaknesses and areas for improvement in your plans.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Review our marketing strategy and provide constructive criticism: highlight strengths, identify potential weaknesses, and suggest specific improvements for each weakness identified.",
                    "placeholder": "Example: Review our marketing strategy and provide constructive criticism...",
                    "description": "A Constructive Criticism prompt example"
                },
                "your_prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your prompt here",
                    "description": "Your custom prompt requesting constructive criticism"
                }
            }
        },

        # Retrieval-Augmented Generation
        {
            "name": "11. Retrieval-Augmented Generation (RAG)",
            "description": "Enhance model responses by providing relevant context from your knowledge base.\n\nAdvantage: Improves accuracy and relevance by grounding responses in specific domain knowledge.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Using our company's product documentation as context, explain the key features and benefits of our enterprise software solution to a potential client in the healthcare sector.",
                    "placeholder": "Example: Using our company's product documentation as context...",
                    "description": "A RAG prompt example"
                },
                "context": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Paste relevant context or documentation here",
                    "description": "The context or documentation to inform the response"
                },
                "query": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your query here",
                    "description": "Your specific question or request"
                }
            }
        },

        # Ensemble Prompting
        {
            "name": "12. Ensemble Prompting",
            "description": "Combine multiple prompting techniques to leverage their complementary strengths.\n\nAdvantage: Creates more comprehensive and nuanced responses by combining different approaches.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "First, use Chain-of-Thought to analyze our current market position. Then, apply Role-based prompting as a financial analyst to evaluate opportunities. Finally, use Constructive Criticism to refine the strategy.",
                    "placeholder": "Example: First, use Chain-of-Thought to analyze...",
                    "description": "An Ensemble prompting example"
                },
                "technique_1": {
                    "type": "text",
                    "required": True,
                    "placeholder": "First prompting technique",
                    "description": "The first prompting technique to apply"
                },
                "technique_2": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Second prompting technique",
                    "description": "The second prompting technique to apply"
                },
                "prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your combined prompt here",
                    "description": "Your prompt combining multiple techniques"
                }
            }
        },

        # Reflection Prompting
        {
            "name": "13. Reflection Prompting",
            "description": "Ask the model to reflect on its own responses and improve them.\n\nAdvantage: Enables iterative refinement and self-correction of responses.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Analyze our customer retention strategy. Then, reflect on your analysis: What assumptions did you make? What aspects might need more consideration? How could the strategy be improved based on this reflection?",
                    "placeholder": "Example: Analyze our customer retention strategy...",
                    "description": "A Reflection prompting example"
                },
                "initial_prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Initial analysis request",
                    "description": "Your initial request for analysis"
                },
                "reflection_points": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Points to reflect upon",
                    "description": "Specific aspects to reflect upon"
                }
            }
        },

        # Structured Output Prompting
        {
            "name": "14. Structured Output Prompting",
            "description": "Request responses in specific formats or structures.\n\nAdvantage: Ensures consistent, organized output that's easy to process and analyze.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Analyze our Q3 performance and provide the response in this structure:\n1. Key Metrics (list top 3)\n2. Trends (bullet points)\n3. Recommendations (numbered list)\n4. Risks (table with likelihood and impact)",
                    "placeholder": "Example: Analyze our Q3 performance...",
                    "description": "A Structured Output prompt example"
                },
                "output_format": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Specify desired output format",
                    "description": "The structure or format for the response"
                },
                "prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your prompt here",
                    "description": "Your prompt requesting structured output"
                }
            }
        },

        # Contrastive Prompting
        {
            "name": "15. Contrastive Prompting",
            "description": "Compare and contrast different approaches or solutions.\n\nAdvantage: Highlights key differences and trade-offs between options.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Compare and contrast two approaches to improving customer satisfaction: 1) Implementing a new CRM system, 2) Expanding the customer support team. Analyze costs, benefits, and implementation challenges of each.",
                    "placeholder": "Example: Compare and contrast two approaches...",
                    "description": "A Contrastive prompting example"
                },
                "option_1": {
                    "type": "text",
                    "required": True,
                    "placeholder": "First option to compare",
                    "description": "Description of the first option"
                },
                "option_2": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Second option to compare",
                    "description": "Description of the second option"
                },
                "comparison_criteria": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Criteria for comparison",
                    "description": "Specific aspects to compare"
                }
            }
        },

        # Default Reasoning Prevention
        {
            "name": "16. Default Reasoning Prevention",
            "description": "Guide the model away from common assumptions and default responses.\n\nAdvantage: Encourages more thoughtful, context-specific responses.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Analyze our market entry strategy for [specific market], but avoid common assumptions about market size and consumer behavior. Consider unique local factors and challenge traditional industry wisdom.",
                    "placeholder": "Example: Analyze our market entry strategy...",
                    "description": "A Default Reasoning Prevention prompt example"
                },
                "context": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Provide relevant context",
                    "description": "Specific context to consider"
                },
                "assumptions_to_avoid": {
                    "type": "text",
                    "required": True,
                    "placeholder": "List assumptions to avoid",
                    "description": "Common assumptions to challenge"
                },
                "prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your prompt here",
                    "description": "Your prompt with specific guidance"
                }
            }
        },

        # Calibrated Question Prompting
        {
            "name": "17. Calibrated Question Prompting",
            "description": "Use specific question types to elicit more detailed and thoughtful responses.\n\nAdvantage: Encourages deeper analysis and more nuanced responses.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "What factors might we be overlooking in our digital transformation strategy? How would addressing these factors impact our timeline and resource allocation? What evidence supports these considerations?",
                    "placeholder": "Example: What factors might we be overlooking...",
                    "description": "A Calibrated Question prompt example"
                },
                "topic": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Topic to explore",
                    "description": "The subject to analyze"
                },
                "question_sequence": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Series of calibrated questions",
                    "description": "Sequence of questions to explore the topic"
                }
            }
        },

        # Constraint-based Generation
        {
            "name": "18. Constraint-based Generation",
            "description": "Set specific constraints or requirements for the response.\n\nAdvantage: Ensures outputs meet specific criteria or limitations.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Generate a product launch plan that: 1) Fits within a $50K budget, 2) Can be executed in 3 months, 3) Requires no more than 5 team members, 4) Focuses on digital channels only.",
                    "placeholder": "Example: Generate a product launch plan that...",
                    "description": "A Constraint-based prompt example"
                },
                "constraints": {
                    "type": "text",
                    "required": True,
                    "placeholder": "List your constraints",
                    "description": "Specific constraints to apply"
                },
                "prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your prompt here",
                    "description": "Your prompt with constraints"
                }
            }
        },

        # Analogical Prompting
        {
            "name": "19. Analogical Prompting",
            "description": "Use analogies to frame business problems in a new light.\n\nAdvantage: Encourages fresh perspectives and can unlock creative solutions by shifting frames of reference.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Think of our customer acquisition process as an ecosystem. If customer acquisition is like attracting specific species to a habitat, describe our current 'ecosystem' health. What 'species' (customer types) are we attracting? What 'environmental factors' (market conditions) are helping or hindering? What 'invasive species' (competitors) are threatening our environment?",
                    "placeholder": "Example: Think of our customer acquisition process as an ecosystem...",
                    "description": "An Analogical prompting example"
                },
                "analogy": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Describe the analogy to use",
                    "description": "The analogy to frame the problem"
                },
                "prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your prompt here",
                    "description": "Your prompt using the analogy"
                }
            }
        },

        # Progressive Disclosure Prompting
        {
            "name": "20. Progressive Disclosure Prompting",
            "description": "Strategically reveal information in stages to guide the model's thinking process.\n\nAdvantage: Allows observation of how new information changes recommendations, resulting in more tailored solutions.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "We need to redesign our online checkout process. First, suggest three potential approaches without knowing our constraints. [Wait for response] Now, considering that we have a requirement to maintain PCI compliance and minimize development time, revise your recommendations. [Wait for response] Finally, knowing that 70% of our customers use mobile devices, further refine your solution.",
                    "placeholder": "Example: We need to redesign our online checkout process...",
                    "description": "A Progressive Disclosure prompt example"
                },
                "initial_prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Initial prompt without constraints",
                    "description": "The first prompt without revealing constraints"
                },
                "additional_info_1": {
                    "type": "text",
                    "required": True,
                    "placeholder": "First set of additional information",
                    "description": "First set of constraints or information to reveal"
                },
                "additional_info_2": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Second set of additional information",
                    "description": "Second set of constraints or information to reveal"
                }
            }
        },

        # Reverse Prompting
        {
            "name": "21. Reverse Prompting",
            "description": "Ask the model to generate the prompt that would produce a specific desired output.\n\nAdvantage: Helps refine question-asking skills and often results in more precisely targeted responses.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "We need a detailed risk assessment for a new financial product launch. Instead of asking directly, construct the ideal prompt that would generate the most comprehensive risk analysis. The prompt should elicit insights about regulatory, market, operational, and reputational risks.",
                    "placeholder": "Example: We need a detailed risk assessment...",
                    "description": "A Reverse prompting example"
                },
                "desired_output": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Describe the desired output",
                    "description": "The type of output you want to receive"
                },
                "output_requirements": {
                    "type": "text",
                    "required": True,
                    "placeholder": "List specific requirements for the output",
                    "description": "Requirements that the output should meet"
                }
            }
        }
    ]
    
    # Проверяем, не существуют ли уже шаблоны с такими именами
    for template_data in templates:
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