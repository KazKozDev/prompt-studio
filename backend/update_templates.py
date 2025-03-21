#!/usr/bin/env python3
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.session import SessionLocal
from app.db.models.user import User
from app.db.models.template import Template

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_templates(db: Session) -> None:
    """Replace all public templates with new business templates."""
    
    # Find admin user
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        logger.error("Admin user not found!")
        return
    
    # Delete all existing templates
    db.query(Template).delete()
    logger.info("Deleted all existing templates")
    
    # Delete all existing public templates
    db.query(Template).filter(Template.is_public == True).delete()
    logger.info("Deleted all existing public templates")
    
    # New advanced prompting techniques for business applications
    business_templates = [
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
                "business_scenario": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Describe the business scenario or problem",
                    "description": "The business situation requiring clarification"
                },
                "clarification_areas": {
                    "type": "text",
                    "required": True,
                    "placeholder": "List areas needing clarification",
                    "description": "Specific aspects where clarifying questions would be helpful"
                }
            }
        },
        
        # Constructive Criticism Prompting
        {
            "name": "10. Constructive Criticism Prompting",
            "description": "Use this method to evaluate and improve solutions that have already been developed.\n\nAdvantage: The model provides objective criticism and helps refine the proposal.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Evaluate the proposed marketing cost optimization strategy, identify weaknesses, and suggest improvements. Explain why certain elements can be changed to increase effectiveness.",
                    "placeholder": "Example: Evaluate the proposed marketing cost optimization strategy...",
                    "description": "A Constructive Criticism prompt example"
                },
                "proposal_to_evaluate": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter the proposal or solution to be evaluated",
                    "description": "The existing proposal that needs critical evaluation"
                },
                "evaluation_criteria": {
                    "type": "text",
                    "required": True,
                    "placeholder": "List criteria for evaluating the proposal",
                    "description": "Specific aspects or metrics to use in the evaluation"
                }
            }
        },
        
        # Retrieval-Augmented Generation (RAG)
        {
            "name": "11. Retrieval-Augmented Generation (RAG)",
            "description": "Enrich requests with data from external sources, such as reports and analytics.\n\nAdvantage: The model relies on current data, allowing it to provide accurate recommendations even if the model's original knowledge is limited.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Using data from the latest market condition report and competitive analysis, suggest 3 strategies to increase the company's market share in the [industry] sector. Justify why the chosen strategies will be effective.",
                    "placeholder": "Example: Using data from the latest market condition report...",
                    "description": "A RAG prompt example"
                },
                "external_data": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Paste relevant external data here",
                    "description": "Data from reports, analytics, or other sources to inform the model"
                },
                "analysis_request": {
                    "type": "text",
                    "required": True,
                    "placeholder": "What analysis do you need based on this data?",
                    "description": "The specific analysis or recommendations needed"
                }
            }
        },
        
        # Ensemble Prompting
        {
            "name": "12. Ensemble Prompting",
            "description": "Combine multiple prompting techniques in a single request to leverage their complementary strengths.\n\nAdvantage: Leverages strengths of multiple techniques to produce more comprehensive solutions.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "[Chain-of-Thought] First, analyze our customer service bottlenecks step by step. Then, [Role-Based] as an operations efficiency expert with experience in call centers, recommend three solutions. Finally, [Constructive Criticism] critique your own recommendations, identifying potential implementation challenges.",
                    "placeholder": "Example: [Chain-of-Thought] First, analyze our customer service bottlenecks...",
                    "description": "An Ensemble prompt combining multiple techniques"
                },
                "business_problem": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Describe the business problem to solve",
                    "description": "The core business challenge to address"
                },
                "techniques_to_combine": {
                    "type": "text",
                    "required": True,
                    "placeholder": "List the techniques to combine (e.g., Chain-of-Thought, Role-Based)",
                    "description": "The specific prompting techniques to combine"
                },
                "combined_prompt": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Write your prompt combining these techniques",
                    "description": "Your custom ensemble prompt combining multiple techniques"
                }
            }
        },
        
        # Reflection Prompting
        {
            "name": "13. Reflection Prompting",
            "description": "Ask the model to reflect on its own responses to enhance quality and depth.\n\nAdvantage: Produces more nuanced responses with explicit recognition of limitations and assumptions.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Propose a market entry strategy for our product. After providing your initial recommendation, pause and reflect on your analysis. What key assumptions have you made? What critical information might be missing? How confident are you in your recommendation based on these considerations?",
                    "placeholder": "Example: Propose a market entry strategy for our product...",
                    "description": "A Reflection prompting example"
                },
                "initial_request": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter your initial business request",
                    "description": "The primary business question or task"
                },
                "reflection_points": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Specific points for reflection (assumptions, limitations, confidence)",
                    "description": "Areas for the model to specifically reflect upon"
                }
            }
        },
        
        # Structured Output Prompting
        {
            "name": "14. Structured Output Prompting",
            "description": "Specify the exact format you want the output to follow.\n\nAdvantage: Ensures the response follows a consistent format that's easy to process and incorporate into existing workflows.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Analyze our competitive positioning and format your response exactly as follows:\nCOMPETITOR: [Competitor Name]\nSTRENGTHS: [List of 3 key strengths]\nWEAKNESSES: [List of 3 key weaknesses]\nTHREAT LEVEL: [High/Medium/Low]\nRECOMMENDED RESPONSE: [2-3 sentence recommendation]\nProvide this analysis for each of our top three competitors.",
                    "placeholder": "Example: Analyze our competitive positioning and format your response exactly as follows...",
                    "description": "A Structured Output prompt example"
                },
                "business_analysis": {
                    "type": "text",
                    "required": True,
                    "placeholder": "What business analysis do you need?",
                    "description": "The specific analysis or information you need"
                },
                "output_format": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Specify the exact output format with headings and structure",
                    "description": "The specific format structure you want the response to follow"
                }
            }
        },
        
        # Contrastive Prompting
        {
            "name": "15. Contrastive Prompting",
            "description": "Ask the model to compare and contrast different approaches or solutions.\n\nAdvantage: Produces clearer differentiation between alternatives, making decision points more apparent.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Compare and contrast two different approaches to launching our new product: 1) a rapid, wide-market launch with significant marketing spend, versus 2) a phased rollout targeting early adopters first. For each approach, analyze resource requirements, risk factors, and potential ROI. Highlight the key differences that would inform our decision.",
                    "placeholder": "Example: Compare and contrast two different approaches to launching our new product...",
                    "description": "A Contrastive prompt example"
                },
                "approach_1": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Describe the first approach or solution",
                    "description": "The first approach to be compared"
                },
                "approach_2": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Describe the second approach or solution",
                    "description": "The second approach to be compared"
                },
                "comparison_criteria": {
                    "type": "text",
                    "required": True,
                    "placeholder": "List criteria for comparison",
                    "description": "The specific factors or criteria for comparing the approaches"
                }
            }
        },
        
        # Default Reasoning Prevention
        {
            "name": "16. Default Reasoning Prevention",
            "description": "Explicitly ask the model to avoid generic answers and prevent default reasoning patterns.\n\nAdvantage: Forces more creative and insightful thinking beyond obvious responses.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Analyze potential disruptions to our supply chain, but avoid generic or obvious answers like 'global pandemic' or 'economic recession.' Instead, focus on industry-specific vulnerabilities and emerging risks that might be overlooked in standard analysis. For each identified risk, provide a specific detection mechanism.",
                    "placeholder": "Example: Analyze potential disruptions to our supply chain, but avoid generic or obvious answers...",
                    "description": "A Default Reasoning Prevention prompt example"
                },
                "business_question": {
                    "type": "text",
                    "required": True,
                    "placeholder": "What business question do you need answered?",
                    "description": "The core business question or analysis needed"
                },
                "generic_answers_to_avoid": {
                    "type": "text",
                    "required": True,
                    "placeholder": "List generic or obvious answers to avoid",
                    "description": "Common or obvious responses that should be avoided"
                },
                "specific_focus": {
                    "type": "text",
                    "required": True,
                    "placeholder": "What specific focus areas should be addressed?",
                    "description": "The specific, non-obvious areas to focus on"
                }
            }
        },
        
        # Calibrated Question Prompting
        {
            "name": "17. Calibrated Question Prompting",
            "description": "Use calibrated questions (those that cannot be answered with a simple yes/no) to elicit deeper insights.\n\nAdvantage: Draws out more nuanced and comprehensive analysis by avoiding confirmation bias.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Regarding our declining market share, what factors do you believe are most influential? What evidence supports this assessment? How would our competitors likely describe our current market position? What would our customers identify as the primary reason they might switch to alternatives?",
                    "placeholder": "Example: Regarding our declining market share, what factors do you believe are most influential?...",
                    "description": "A Calibrated Question prompt example"
                },
                "business_context": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Describe the business context or challenge",
                    "description": "The business situation requiring deeper analysis"
                },
                "calibrated_questions": {
                    "type": "text",
                    "required": True,
                    "placeholder": "List your calibrated questions (What, How, Why questions)",
                    "description": "Open-ended questions that cannot be answered with yes/no"
                }
            }
        },
        
        # Constraint-based Generation
        {
            "name": "18. Constraint-based Generation",
            "description": "Set specific constraints on how the model should generate its response.\n\nAdvantage: Forces creativity within boundaries and often produces more precise communication.",
            "is_public": True,
            "structure": {
                "example_prompt": {
                    "type": "text",
                    "required": False,
                    "default_value": "Create a value proposition for our new enterprise software solution using exactly 30 words. Then, expand it into a one-paragraph pitch using no more than 3 industry-specific terms. Finally, develop a full-page description without using any superlatives like 'best' or 'leading.'",
                    "placeholder": "Example: Create a value proposition for our new enterprise software solution...",
                    "description": "A Constraint-based Generation prompt example"
                },
                "content_request": {
                    "type": "text",
                    "required": True,
                    "placeholder": "What content do you need generated?",
                    "description": "The specific content you need created"
                },
                "constraints": {
                    "type": "text",
                    "required": True,
                    "placeholder": "List specific constraints (length, format, terms to use/avoid)",
                    "description": "The specific constraints that must be followed"
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
                    "description": "An Analogical prompt example"
                },
                "business_problem": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Describe the business problem to analyze",
                    "description": "The business challenge that needs a fresh perspective"
                },
                "analogy": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Suggest an analogy to frame the problem (e.g., ecosystem, machine)",
                    "description": "The analogy to use for reframing the problem"
                },
                "mapping_elements": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Map business elements to analogy elements",
                    "description": "How different business elements map to the analogy"
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
                "initial_request": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Initial request without constraints",
                    "description": "The basic request without additional context"
                },
                "additional_context_1": {
                    "type": "text",
                    "required": True,
                    "placeholder": "First additional piece of context",
                    "description": "The first constraint or context to add"
                },
                "additional_context_2": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Second additional piece of context",
                    "description": "The second constraint or context to add"
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
                    "placeholder": "Example: We need a detailed risk assessment for a new financial product launch...",
                    "description": "A Reverse Prompting example"
                },
                "desired_output": {
                    "type": "text",
                    "required": True,
                    "placeholder": "Describe the output you ultimately want",
                    "description": "The specific type of output or analysis you need"
                },
                "output_requirements": {
                    "type": "text",
                    "required": True,
                    "placeholder": "List specific requirements for the output",
                    "description": "What specific elements the output should include"
                }
            }
        }
    ]
    
    # Create new templates
    for template_data in business_templates:
        # Create structure in the right format for DB
        structure_dict = {}
        for key, value in template_data["structure"].items():
            structure_dict[key] = value
        
        # Create new template
        template = Template(
            name=template_data["name"],
            description=template_data["description"],
            structure=structure_dict,
            is_public=template_data["is_public"],
            user_id=admin.id
        )
        db.add(template)
    
    # Save changes to DB
    db.commit()
    logger.info(f"Added {len(business_templates)} new public templates")

def main() -> None:
    logger.info("Updating templates")
    db = SessionLocal()
    try:
        update_templates(db)
    finally:
        db.close()
    logger.info("Templates updated successfully")

if __name__ == "__main__":
    main() 