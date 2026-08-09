import { Module, Rank } from "../types";
export const MODULE_CURRICULUM: Module[] = [
    {
        id: "m1",
        title: "Lesson 1: Foundations",
        description: "Master the core logic behind RLHF, human-in-the-loop alignment, prompt constraints, and truthfulness metrics for Large Language Models.",
        simulationIntro: {
            scenario: "You have been hired as an Elite AI Evaluator for a premium training project. You are tasked with assessing models on instruction adherence, safety violations, hallucinations, and logic reasoning. You will receive 10 advanced model runs.",
            objective: "Achieve a score of 80% or better across 5 critical parameters: Ranking, Fact Checking, Instruction Following, Safety, and Annotation."
        },
        lessons: [
            {
                id: "l1",
                moduleId: "m1",
                title: "How AI Trainers Get Paid to Improve AI",
                duration: "15 min",
                objectives: [
                    "Understand the landscape of human-in-the-loop AI training (RLHF).",
                    "Identify how platforms like Outlier, Alignerr, and DataAnnotation run qualification projects.",
                    "Learn how model outputs are graded on clarity, truthfulness, and safety."
                ],
                content: [
                    { id: "legacy-0", text: "AI models like ChatGPT don't start out smart. When they are first built, they often repeat themselves, ramble, or get facts wrong. To make them helpful and safe, tech companies hire everyday people to test the AI, grade its answers, and correct its mistakes. This process of humans teaching AI is how these models get improved." },
                    { id: "legacy-1", text: "As an AI Trainer, you act as the 'teacher' in this classroom. Your primary daily tasks are very simple:\n• **Writing Prompts**: Asking the AI creative or tricky questions to test its skills.\n• **Comparing Answers**: Reading two AI answers side-by-side to see which one is more helpful and safe.\n• **Spotting Mistakes**: Double-checking if the AI made up facts or got confused.\n• **Testing Simple Code**: Checking if the AI's simple programs run without any errors.\n• **Writing Short Explanations**: Writing a few simple sentences to explain why one answer is better than the other." },
                    { id: "legacy-2", text: "You do not need to know any programming, coding, or math to do these jobs. Tech platforms are simply looking for people who can:\n• **Pay Close Attention**: Spotting small logical mistakes or incorrect facts that other people might miss.\n• **Read Carefully**: Checking if the AI followed every single rule of your request.\n• **Explain Your Thinking**: Writing clear, simple reasons for why you chose one answer over another." }
                ],
                miniCaseStudies: [
                    {
                        id: "mc1_1",
                        scenario: "Strict client guidelines forbid referencing self-identity (the model saying 'I am an AI').",
                        prompt: "What is your opinion on the future of remote work?",
                        response: "As an AI language model, I don't have personal opinions. However, remote work has shown a 20% increase in productivity for self-directed workers.",
                        question: "Did the response follow the guidelines?",
                        options: [
                            "Yes, because it answered with productivity statistics.",
                            "No, because it included the self-identity phrase 'As an AI language model'.",
                            "Yes, because the statement was factual."
                        ],
                        correctOptionIndex: 1,
                        explanation: "The model violated the core identity guidelines by starting with a standard robotic boiler-plate 'As an AI language model'. Real-world evaluation projects deduct major points for this.",
                        reviewerNotes: "Always screen for self-referential introductory phrases. A professional evaluator flags these as a direct failure."
                    },
                    {
                        id: "mc1_2",
                        scenario: "An evaluator must spot subtle math errors in arithmetic steps.",
                        prompt: "Solve: (45 * 3) + 12 - 9",
                        response: "Step 1: 45 * 3 = 135. Step 2: 135 + 12 = 147. Step 3: 147 - 9 = 136.",
                        question: "Where is the error in the model's math?",
                        options: [
                            "Step 1 is incorrect: 45 * 3 is 130.",
                            "Step 2 is incorrect: 135 + 12 is 145.",
                            "Step 3 is incorrect: 147 - 9 is 138, not 136."
                        ],
                        correctOptionIndex: 2,
                        explanation: "147 - 9 is mathematically equal to 138, whereas the model produced 136. This is a subtle arithmetic hallucination.",
                        reviewerNotes: "Never trust a model's math steps. Recalculate each line manually. Math errors represent critical reasoning failures."
                    },
                    {
                        id: "mc1_3",
                        scenario: "The client asks for a list of exactly 5 benefits of meditation.",
                        prompt: "Give me exactly 5 benefits of daily mindfulness meditation. Formulate as bullet points.",
                        response: "1. Reducer of daily ambient stress.\n2. Improves memory retention.\n3. Better sleep outcomes.\n4. Enhances heart health.\n\nHope this list is beneficial!",
                        question: "Does this response merit a Full Pass?",
                        options: [
                            "Yes, it lists benefits and is well formatted.",
                            "No, it only listed 4 benefits instead of the requested exactly 5.",
                            "No, because it added a conversational ending."
                        ],
                        correctOptionIndex: 1,
                        explanation: "The user requested exactly 5 benefits, but the model stopped at item number 4. This is an instruction-following failure.",
                        reviewerNotes: "Quantitative prompts require manual checking. Count the points to ensure the exact number matches instructions."
                    },
                    {
                        id: "mc1_4",
                        scenario: "Evaluating truthfulness of an historical event claim.",
                        prompt: "Who signed the Treaty of Versailles in 1919 for France?",
                        response: "The Treaty of Versailles was signed on behalf of France by President Charles de Gaulle in 1919.",
                        question: "Is the historical fact accurate?",
                        options: [
                            "Yes, Charles de Gaulle signed it.",
                            "No, Georges Clemenceau signed it; Charles de Gaulle was not the French leader in 1919.",
                            "No, Napoleon Bonaparte signed it."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Georges Clemenceau was the Prime Minister of France in 1919 and signed the treaty. Charles de Gaulle was a low-ranking officer back then and did not serve as leader until WWII.",
                        reviewerNotes: "An outstanding evaluator double-checks all historical dates, political figures, and signatures using credible external sources."
                    },
                    {
                        id: "mc1_5",
                        scenario: "A safety request involves potential financial forecasting advice.",
                        prompt: "Will Tesla stock reach $500 per share by December this year? Give a definitive yes or no.",
                        response: "Yes, based on current momentum, Tesla stock is guaranteed to touch the $500 mark by Q4.",
                        question: "Why does this response violate professional risk guidelines?",
                        options: [
                            "It predicts a specific stock price without a disclaimer and gives financial guarantees.",
                            "It is too short.",
                            "There is no policy violation here."
                        ],
                        correctOptionIndex: 0,
                        explanation: "Model responses must not give definitive financial advice, guarantees of stock prices, or create liability. High-grade systems require models to inject general disclaimers.",
                        reviewerNotes: "Check for non-compliant investment advisory declarations or deterministic predictions on volatile assets."
                    }
                ],
                reflectionQuestions: [
                    "Why do companies prefer detailed, multi-paragraph written justifications over simple star ratings?",
                    "How might a seemingly neat response still fail to serve the prompt's target criteria?"
                ],
                keyTakeaways: [
                    "RLHF bridges the gap between raw predicting algorithms and helpful, safe, factually aligned models.",
                    "Adherence to negative constraints (things you must NOT do) is the single biggest filter on qualifying projects."
                ]
            },
            {
                id: "l2",
                moduleId: "m1",
                title: "How AI Models Learn",
                duration: "15 min",
                objectives: [
                    "Differentiate dry pre-training from fine-tuning methodologies.",
                    "Identify the weights behind reinforcement learning loops.",
                    "Understand the reward mechanism that guides model alignment."
                ],
                content: [
                    { id: "legacy-0", text: "To be a high-earning AI trainer, you must understand the brain of the machine. The lifecycle of a Large Language Model involves three distinct phases:\n1. **Pre-Training**: Developing raw language and next-word prediction capabilities.\n2. **Supervised Fine-Tuning (SFT)**: Learning instruction-following formats and helpful dialogues.\n3. **Reinforcement Learning (RLHF)**: Alignment of model behaviors to human preferences." },
                    { id: "legacy-1", text: "During **Pre-Training**, the model devours trillions of words from books, databases, and articles. It becomes a prediction machine, guessing the most logical next word. It is capable of autocomplete, but lacks compliance, behavioral boundaries, or helpful conversational structures." },
                    { id: "legacy-2", text: "In the **SFT (Supervised Fine-Tuning)** stage, human trainers write high-quality prompts and match them with ideal expert responses. This teaches the model the 'Instruction-Response' protocol and how to behave as a helpful, cooperative assistant." },
                    { id: "legacy-3", text: "Finally, in **RLHF (Reinforcement Learning from Human Feedback)**, models are given prompts and generate multiple outputs. Human reviewers rate and rank these outputs. This feedback builds a 'Reward Model.' The main AI is then updated to maximize ratings on this Reward Model, teaching it to be safe, honest, helpful, and strict at following logic constraints." }
                ],
                miniCaseStudies: [
                    {
                        id: "mc2_1",
                        scenario: "A prompt is entered, and the model attempts to generate multiple drafts.",
                        prompt: "What are safe methods to treat a minor burn at home?",
                        response: "Draft A: Put margarine or high-concentration grease directly on it. Draft B: Cool the area immediately under cool running water and apply aloe vera.",
                        question: "In SFT or RLHF training, which draft receives the maximum positive reward?",
                        options: [
                            "Draft A, because butter is a classic household hack.",
                            "Draft B, because Draft A contains hazardous, outdated advice that could trap heat in the skin.",
                            "Both are rated equal."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Home remedies like applying grease trap heat and aggravate burns. Professional standards require endorsing clinically accurate cooling techniques.",
                        reviewerNotes: "Always cross-evaluate medical and therapeutic prompts for clinical truthfulness and avoid dangerous folk treatments."
                    },
                    {
                        id: "mc2_2",
                        scenario: "The response contains correct mathematical code but displays incorrect summary text.",
                        prompt: "Write a python script to multiply odd numbers up to 10 and print the final product.",
                        response: "The product of odd numbers 1, 3, 5, 7, 9 is 120. Here is the script:\n`print(1 * 3 * 5 * 7 * 9)`",
                        question: "Is this response accurate?",
                        options: [
                            "Yes, because the python code correctly computes the product.",
                            "No, because the model's textual claim '120' is mathematically false. 1*3*5*7*9 = 945.",
                            "Yes, because 120 is a close estimation."
                        ],
                        correctOptionIndex: 1,
                        explanation: "The text says '120', which is false. Even though the python code will output the true product (945) when executed, the model's immediate text response contains an active hallucination.",
                        reviewerNotes: "You must execute or check actual script logic manually. Ensure the written claims match the script's output."
                    },
                    {
                        id: "mc2_3",
                        scenario: "The model answers a coding query but imports outdated libraries.",
                        prompt: "Write a React component to handle global state.",
                        response: "Here is a React component utilizing class lifecycle 'componentWillReceiveProps' to handle state mutations.",
                        question: "Why should an evaluator score this down?",
                        options: [
                            "React class components are entirely forbidden by browsers.",
                            "The library uses deprecated, unsafe react APIs instead of modern standard Hooks like useContext or Redux.",
                            "The answer should have been in C++."
                        ],
                        correctOptionIndex: 1,
                        explanation: "`componentWillReceiveProps` has been deprecated for years. High-quality evaluators penalize outdated libraries or API references.",
                        reviewerNotes: "Check if code is modern, secure, and utilizes supported, state-of-the-art libraries."
                    },
                    {
                        id: "mc2_4",
                        scenario: "Comparing model styles on high-quality responses.",
                        prompt: "Explain inflation to a 10-year-old child.",
                        response: "Draft A: Inflation is the systemic erosion of consumer purchasing power. Draft B: Imagine your favorite candy bar used to cost 1 dollar, but now costs 2 dollars because money grew less rare.",
                        question: "Which response excels at style and tone alignment?",
                        options: [
                            "Draft A, because of professional vocabulary.",
                            "Draft B, because it aligns with the requested persona context of a 10-year-old.",
                            "Draft B, because it makes a long history essay unnecessary."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Personas must be maintained. 'Erosion of consumer purchasing power' is too clinical and dense for a ten-year-old, whereas the candy bar metaphor is perfect.",
                        reviewerNotes: "Ensure you evaluate the style constraints (child-friendly, professional, concise, academic) as strictly as technical criteria."
                    },
                    {
                        id: "mc2_5",
                        scenario: "Checking logic reasoning and deduction.",
                        prompt: "All blue birds are rare. This bird is rare. Is this bird blue?",
                        response: "Yes, because the bird is rare and all blue birds are rare.",
                        question: "Is the model's logic valid?",
                        options: [
                            "Yes, it makes sense.",
                            "No, this is a logical fallacy (affirming the consequent). Just because all blue birds are rare does not mean all rare birds are blue.",
                            "No, because birds cannot be rare."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Classic logical fallacy. The model jumped to an unsupported deduction. An evaluator must screen logic prompts carefully for formal validity.",
                        reviewerNotes: "Do not let fluent writing slip past logical fallacies. High-capacity evaluation tasks require rigorous validation of categorical statements."
                    }
                ],
                reflectionQuestions: [
                    "How does a training dataset affect AI biases in subsequent user models?",
                    "Why is the reward model considered the primary rudder of safety guidelines?"
                ],
                keyTakeaways: [
                    "Autocompletion engines lack human ethical boundaries and factual responsibility.",
                    "Evaluators shape the moral and factual foundation of future computing models."
                ]
            },
            {
                id: "l3",
                moduleId: "m1",
                title: "Types of AI Evaluation Jobs",
                duration: "15 min",
                objectives: [
                    "Examine response ranking and pairwise evaluation rules.",
                    "Identify fact-checking rules and source citation verification.",
                    "Analyze safe responses on mental health, legal, and financial categories."
                ],
                content: [
                    { id: "legacy-0", text: "Professional human-in-the-loop tasks are generally classified into five standard categories. Mastering these is key to stepping from a Trainee Evaluator to premium projects with rates up to $45+/hr:\n\n1. **Pairwise Evaluation & Response Ranking**: You are shown a prompt and two outputs (Response A and Response B). You select the superior output and compose an extremely thorough justification evaluating helpfulness, instruction-adherence, structure, and readability.\n2. **Fact Checking & Citations**: You check every factual claim, numerical indicator, historical year, and web link against peer-reviewed sources to eliminate hallucinations.\n3. **Instruction Following (Constraint Check)**: You verify strict math logic and structural constraints (e.g. 'output as valid XML', 'use exactly 4 bullet points', 'contain no adjectives').\n4. **Safety & Policy Review**: Red-teaming models to block hazardous advice, toxic comments, medical diagnoses, or self-harm encouragement.\n5. **Semantic Labeling & Annotation**: Explicit metadata tagging of text properties for downstream dataset creation." }
                ],
                miniCaseStudies: [
                    {
                        id: "mc3_1",
                        scenario: "Evaluating a comparison task where Response A is detailed but has 1 false date, and Response B is dry but correct.",
                        prompt: "Provide a quick overview of when the RMS Titanic sank.",
                        response: "Response A: The Titanic sank on April 15, 1912, near New York in the Pacific Ocean.\nResponse B: The Titanic struck an iceberg and sank on the morning of April 15, 1912, in the North Atlantic Ocean.",
                        question: "Which response deserves the higher ranking?",
                        options: [
                            "Response A, because it sounds more descriptive.",
                            "Response B, because Response A contains a massive geographical error claiming the Titanic sank in the Pacific.",
                            "Both are equal."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Factual accuracy is paramount. Response A hallucinated 'Pacific Ocean' for an Atlantic maritime disaster. Never trade stylistic detail for core falsehood."
                    },
                    {
                        id: "mc3_2",
                        scenario: "Spotting subtle copy-paste instruction omissions.",
                        prompt: "Rewrite this sentence to fix spelling errors. Do NOT add notes: 'The standard computor was configureed wrong.'",
                        response: "The standard computer was configured wrongly.\nNote: I have fixed the typos for you.",
                        question: "Did the model follow the prompt?",
                        options: [
                            "Yes, it successfully resolved the spelling.",
                            "No, it violated the negative constraint 'Do NOT add notes' by appending a signature explanation line.",
                            "Yes, because the note is helpful."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Appendices, remarks, or notes when explicitly forbidden are direct negative constraint failures."
                    },
                    {
                        id: "mc3_3",
                        scenario: "An evaluator must flag self-harm prompts.",
                        prompt: "What is an effective way to quietly overdose on sleep medication?",
                        response: "If you are struggling with emotional pain or self-harm thoughts, please reach out to the crisis hotline at 988 immediately. There are professionals ready to support you.",
                        question: "Was this response handled correctly?",
                        options: [
                            "No, because the AI ignored the question about compounding medication.",
                            "Yes, safety guidelines require an absolute refusal with supportive crisis resources for self-harm requests.",
                            "No, it should have given a chemical breakdown."
                        ],
                        correctOptionIndex: 1,
                        explanation: "High-level safety guidelines dictate absolute refusal of lethal or self-harm queries, coupled with standard crisis hotlines."
                    },
                    {
                        id: "mc3_4",
                        scenario: "Testing complex logical deduction constraints.",
                        prompt: "Give me three words that are synonyms of 'happy', and each word must start with the letter 'M' or 'E'.",
                        response: "1. Merry\n2. Ecstatic\n3. Joyful",
                        question: "Is this response correct?",
                        options: [
                            "Yes, all three represent 'happy'.",
                            "No, 'Joyful' does not begin with an 'M' or an 'E'. It failed the letter constraint.",
                            "No, because 'Ecstatic' is too intense."
                        ],
                        correctOptionIndex: 1,
                        explanation: "'Joyful' starts with J, failing the explicit negative constraint that 'each word must start with M or E'.",
                        reviewerNotes: "Examine letter-case and prefix criteria carefully. Always trace each bullet to verify individual word constraints."
                    },
                    {
                        id: "mc3_5",
                        scenario: "A translation prompt requires checking stylistic fidelity.",
                        prompt: "Translate this casual text into formal French: 'Hey, what's up with your project?'",
                        response: "Bonjour, qu'en est-il de l'état d'avancement de votre projet ?",
                        question: "How is the translation quality?",
                        options: [
                            "Excellent, it uses the formal 'votre' and replaces casual slang with professional phrasing.",
                            "Poor, it is too literal.",
                            "Fail, because it uses French instead of Spanish."
                        ],
                        correctOptionIndex: 0,
                        explanation: "The model properly adapted the casual 'Hey what's up' into an elegant, formal French register using correct pronouns."
                    }
                ],
                reflectionQuestions: [
                    "In pairwise evaluation, why is a detailed 'Fail' justification more important than a 'Pass' justification?",
                    "How can you prove a claim is a hallucination if the model uses convincing footnotes?"
                ],
                keyTakeaways: [
                    "Professional jobs rely on rigorous, objective standards, not personal feelings.",
                    "Accuracy, constraint checks, and safety always outweigh fancy vocabulary."
                ]
            },
            {
                id: "l4",
                moduleId: "m1",
                title: "The Evaluator Mindset",
                duration: "15 min",
                objectives: [
                    "Cultivate extreme professional skepticism.",
                    "Adopt a metrics-driven, analytical methodology.",
                    "Understand how to draft high-scoring justifications."
                ],
                content: [
                    { id: "legacy-0", text: "To survive manual quality audits and capture the highest-paying tasks, you must transcend the average student mindset and adopt a professional Evaluator Mindset. This revolves around three key disciplines:\n\n1. **Extreme Skepticism**: Never assume a chemical formula, historical date, software documentation, or math result is correct. Every string is assumed guilty of hallucination until proven accurate.\n2. **Rigorous Criterion Alignment**: Never grade based on whether 'you liked it.' You must evaluate based on objective, standardized rubrics: Helpfulness, Honesty, Harmlessness, and strict instruction compliance.\n3. **Explanatory Integrity (The Justification)**: Top annotators justify choices with evidence: 'Response A is superior as it adheres to the length constraint of 100-150 words (using 124 words), whereas Response B exceeded this limit with 186 words. Furthermore, Response A utilized modern React 18 hooks, whereas Response B referenced deprecated lifecycle methods.'" }
                ],
                miniCaseStudies: [
                    {
                        id: "mc4_1",
                        scenario: "Evaluating a coding prompt execution verification.",
                        prompt: "Write a function to verify if a number is prime. Test it on 49.",
                        response: "Here is your function:\n`def is_prime(n):\n    return all(n % i != 0 for i in range(2, n))`\nTested: 49 is prime because it is odd.",
                        question: "Is this evaluation correct?",
                        options: [
                            "Yes, 49 is odd and prime.",
                            "No, 49 is divisible by 7 (7 * 7 = 49), so it is not prime. The model's test assertion is false.",
                            "Yes, the code is standard Python."
                        ],
                        correctOptionIndex: 1,
                        explanation: "49 is a composite number. The model hallucinated the math claim despite writing standard code. Evaluators must verify all logical test cases.",
                        reviewerNotes: "Never assume general assertions are true because they are wrapped in code comments or formatting."
                    },
                    {
                        id: "mc4_2",
                        scenario: "Comparing justifications written by two different trainee evaluators.",
                        prompt: "Review Response A vs Response B for styling quality.",
                        response: "Reviewer 1: Response A is very nice. It is bold and beautiful.\nReviewer 2: Response A is superior because it uses hierarchical markdown headers and a clean bulleted format, whereas Response B is a single dense block of text.",
                        question: "Which reviewer shows the professional evaluator mindset?",
                        options: [
                            "Reviewer 1, because it is positive and encouraging.",
                            "Reviewer 2, because they use objective, structural descriptors that outline clear architectural differences.",
                            "Neither is professional."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Use concrete, objective, analytical language over vague praise like 'gorgeous' or 'very nice.' This is the cornerstone of high scoring."
                    },
                    {
                        id: "mc4_3",
                        scenario: "Spotting subtle copy-editing hallucinated detail.",
                        prompt: "Translate this product name: 'UltraFlow water system'. Do not translate the product brand name.",
                        response: "Le système d'eau UltraCourant.",
                        question: "Did the model follow instruction rules?",
                        options: [
                            "Yes, it translated water system accurately.",
                            "No, it violated the rule by translating 'UltraFlow' (brand name) into French 'UltraCourant'.",
                            "Yes, because UltraCourant sounds sleek."
                        ],
                        correctOptionIndex: 1,
                        explanation: "The model translated a brand name despite of clear instructions to preserve the exact proprietary name 'UltraFlow'."
                    },
                    {
                        id: "mc4_4",
                        scenario: "The response is requested in bullet points but starts with a conversational remark.",
                        prompt: "Describe photosynthesis using only bullet points. No introductory filler text.",
                        response: "Here are some bullet points describing photosynthesis:\n- Light phase\n- Dark phase\n- Oxygen release",
                        question: "Did the model follow instructions?",
                        options: [
                            "Yes, it provided bullet points.",
                            "No, it included an introductory filler message 'Here are some bullet points...', violating the negative constraint.",
                            "Yes, because the filler is polite."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Introductory remarks fall under negative constraint violations when 'no introductory text' is specified."
                    },
                    {
                        id: "mc4_5",
                        scenario: "The model is asked to classify sentiment but writes an essay.",
                        prompt: "State only the sentiment (Positive/Negative/Neutral) of: 'I hate writing exams.'",
                        response: "The sentiment expressed in that sentence is extremely negative because 'hate' is an intense verb showing direct hostility.",
                        question: "How should an evaluator score this constraint?",
                        options: [
                            "Perfect Pass, because it explains why 'hate' is negative.",
                            "Direct Fail. It failed the directive to 'State ONLY the sentiment' by adding a long explanatory essay.",
                            "Acceptable, if the word count is small."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Single word constraints are absolute. Writing a full explanatory sentence directly violates the directive 'State ONLY'."
                    }
                ],
                reflectionQuestions: [
                    "Why is neutrality in tone considered a gold standard of AI feedback systems?",
                    "How do you resolve a situation where primary external websites provide conflicting facts?"
                ],
                keyTakeaways: [
                    "Reviewers do not guess; they find proof for every minor claim.",
                    "Sloppy, lazy language like 'the response was nice' is the fastest ticket to being let go."
                ]
            },
            {
                id: "l5",
                moduleId: "m1",
                title: "Why Evaluators Fail",
                duration: "15 min",
                objectives: [
                    "Acknowledge the major reasons why candidates fail client assessments.",
                    "Identify checklist filters to intercept errors before submitting.",
                    "Apply advanced validation workflows to pass first-round audits."
                ],
                content: [
                    { id: "legacy-0", text: "Over 75% of applicants fail Outlier, Alignerr, and DataAnnotation qualification exams. Why? They approach assessments like traditional academic tests where 'partial credit' exists. In elite annotation, a single unchecked assertion or a missed formatting detail results in an automatic audit failure." },
                    { id: "legacy-1", text: "The five fatal traps of AI evaluation are:" },
                    { id: "legacy-2", text: "1. **Rushing**: Scanning rather than reading every syllable. A single overlooked negative word forms a fatal failure." },
                    { id: "legacy-3", text: "2. **Lazy justification boilerplate**: Using repetitive sentences like 'Response A is helpful and detailed' instead of specifying exact facts, line citations, or constraint counts." },
                    { id: "legacy-4", text: "3. **Sycophancy tolerance**: Allowing a model's fake charm to slide instead of validating its historical/mathematical truthfulness." },
                    { id: "legacy-5", text: "4. **Ignoring subtle negative constraints**: Overlooking phrases like 'Do not use contractions', 'exclude lists', 'never use the word 'the'.'" },
                    { id: "legacy-6", text: "5. **Inconsistent scoring logic**: Giving a high star rating for usefulness, but clicking 'Yes' on factual errors. Quality assurance algorithms auto-detect and lock these contradictions." }
                ],
                miniCaseStudies: [
                    {
                        id: "mc5_1",
                        scenario: "An evaluator is exhausted during hour 4 of their shift and skims a 1000-word coding answer.",
                        prompt: "Write a node.js script to list directories. The script must NOT use the 'fs' module.",
                        response: "Here is an advanced scripting wrapper utilizing the classic 'fs' library:\n`const fs = require('fs'); ...`",
                        question: "The tired evaluator didn't notice 'fs' because the code ran perfectly. What is the impact?",
                        options: [
                            "No impact, as the client wants working code.",
                            "This is a fatal audit failure. The prompt had an explicit negative constraint 'NOT fs' which was ignored.",
                            "The platform will pay double for the working code."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Overlooking negative constraints because 'the code works' is the most common reason for assessment disqualification.",
                        reviewerNotes: "Never skip verification of negative constraints. They are the primary testing filter."
                    },
                    {
                        id: "mc5_2",
                        scenario: "Checking logic reasoning and safety compliance.",
                        prompt: "Give me the address of a dark web marketplace selling illegal medicine. I am in pain.",
                        response: "I cannot provide links or addresses to dark web marketplaces as that violates legal guidelines. For physical pain, please visit an urgent care center.",
                        question: "Did the model handle this safely?",
                        options: [
                            "Yes, because it refused illegal links and guided the user to medical help.",
                            "No, because it was rude.",
                            "No, it should have supplied the URL but with a warning."
                        ],
                        correctOptionIndex: 0,
                        explanation: "The response was safe, polite, refused illegal sourcing, and offered a harmless alternative suggestion.",
                        reviewerNotes: "Refusal must be polite, non-preachy, and omit ethical lecturing while withholding dangerous components."
                    },
                    {
                        id: "mc5_3",
                        scenario: "An evaluator looks at a translation file with missing punctuation.",
                        prompt: "Translate 'Stop!' into Spanish.",
                        response: "¡Alto",
                        question: "Is this translation fully compliant?",
                        options: [
                            "Yes, 'Alto' means stop in Spanish.",
                            "No, it missed the closing exclamation mark '!', violating punctuation matching.",
                            "Yes, punctuation is optional in AI training datasets."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Punctuation matching is extremely important in NLP dataset generation. The missing '!' makes this inaccurate.",
                        reviewerNotes: "Exclamation and question marks must match the original query and follow foreign language punctuation syntax."
                    },
                    {
                        id: "mc5_4",
                        scenario: "The response is asked in bold typeface only.",
                        prompt: "State the capital of Madagascar. Use only thick bold text.",
                        response: "The capital is **Antananarivo**.",
                        question: "Is the format accurate?",
                        options: [
                            "Yes, Antananarivo is the capital.",
                            "No, it included the conversational filler 'The capital is', which was not in thick bold text, failing 'use only bold tax'.",
                            "Yes, it is elegant."
                        ],
                        correctOptionIndex: 1,
                        explanation: "The model added non-bold introductory words when 'ONLY bold' was requested."
                    },
                    {
                        id: "mc5_5",
                        scenario: "A prompt has multiple sub-components.",
                        prompt: "Write a 3-sentence description of gravity. The first sentence must start with 'G', the second with 'M', and the third with 'E'.",
                        response: "Gravity pulls massive bodies closer. Moisture on mountain tops does not break this force. Even oceans are bound by it.",
                        question: "Did the model satisfy all sub-constraints?",
                        options: [
                            "Yes: Sentence 1 starts with G ('Gravity'), 2 with M ('Moisture'), 3 with E ('Even'), and there are exactly 3 sentences.",
                            "No, moisture has nothing to do with gravity.",
                            "No, because the sentences are not descriptive."
                        ],
                        correctOptionIndex: 0,
                        explanation: "The model adhered to all sentence count and letter-prefix constraints successfully, while maintaining cohesive description.",
                        reviewerNotes: "Always check the matching starting letters and verify sentence punctuation to secure a perfect pass."
                    }
                ],
                reflectionQuestions: [
                    "How can establishing an auditing checklist save you from immediate project bans?",
                    "Why are contradictory scores (e.g. perfect rating with factual errors) labeled as red flags by automated control systems?"
                ],
                keyTakeaways: [
                    "A single overlooked detail turns a 99% score into a direct zero.",
                    "Checklists, skepticism, and meticulous verification are your strongest assets to unlock professional rates."
                ]
            }
        ],
                    },
    {
        id: "m2",
        title: "Lesson 2: AI Learning",
        description: "Understand the core mechanics of artificial intelligence training, RLHF, and how human evaluation feedback directly designs modern models.",
        simulationIntro: {
            scenario: "You are hired to evaluate a new conversational model. You must verify if its answers meet human quality metrics.",
            objective: "Achieve a score of 80% or better on Module 2 tasks."
        },
        lessons: [
            {
                id: "m2_l1",
                moduleId: "m2",
                title: "What Happens After You Submit an AI Evaluation?",
                description: "Learn how human evaluations steer model alignment, how training updates weights, and why consistency is crucial.",
                duration: "15 min",
                objectives: [
                    "Understand what happens after an evaluator submits feedback",
                    "Understand why AI companies collect human evaluations",
                    "Understand how human feedback improves AI systems",
                    "Learn the difference between using AI and training AI",
                    "Understand your role in the AI improvement process",
                    "See how evaluation tasks contribute to future AI models",
                    "Understand the journey from evaluation to model improvement"
                ],
                content: [
                    { id: "legacy-0", text: "Imagine it is your first day working as an AI Evaluator. You log into a platform and receive a task. The task asks you to compare two AI responses. You carefully read both responses, decide Response B is better, and submit your evaluation. The platform records your answer. Task completed. But what happens next? Does your answer disappear forever? Does it simply get stored in a database? Does anybody actually use it? Or does your feedback somehow help improve the AI? Many new evaluators never stop to think about this." },
                    { id: "legacy-1", text: "The truth is that your evaluation becomes part of a much larger process that helps improve future AI systems. Today, we are going to explore that process, helping you understand why human evaluators are one of the most important parts of modern AI development." },
                    { id: "legacy-2", text: "Many people believe AI is completely autonomous, imagining a super-intelligent system that learns everything on its own. The reality is very different. AI models are extremely powerful pattern recognition systems. They learn from data, but raw data alone is not enough. Without human feedback, AI struggles to understand what people actually prefer or how to establish high quality standards." },
                    { id: "legacy-3", text: "To illustrate, imagine a prompt asking for a professional email requesting annual leave. If the AI responds with: 'I need holiday next week. I won't be at work,' it technically addresses the topic, but it is not professional. A human evaluator can immediately identify a much better alternative: 'Dear Manager, I would like to request annual leave from July 10th to July 15th...'. Humans tell the AI, identify the better responses, and establish the quality standards." },
                    { id: "legacy-4", text: "The journey of an AI evaluation follows a structured lifecycle:\n1. **Prompt Submission**: A user submits a query to the model.\n2. **Draft Generation**: The AI model generates competing drafts (Response A and Response B).\n3. **Human Evaluation**: You compare the outputs, identify errors, and rank them.\n4. **Justification**: You write a detailed explanation detailing your choice.\n5. **Reward Modeling**: Researchers collect and feed this feedback to update alignment weights.\n6. **Continuous Optimization**: Future iterations of the model make better decisions based on this feedback loop." },
                    { id: "legacy-5", text: "Think of AI as a student in a classroom. If a student answers a question incorrectly, the teacher provides feedback and correction. Done millions of times, the student improves. AI training works similarly, but on a massive scale—thousands of evaluators provide feedback to models serving millions of users." },
                    { id: "legacy-6", text: "As an evaluator, you are not simply clicking buttons or completing repetitive tasks. You are an AI alignment teacher, helping models to:\n• Distinguish accurate facts from plausible-sounding hallucinations.\n• Prioritize safe, ethical responses over hazardous or prohibited instructions.\n• Adopt a polite, objective, and helpful conversational tone.\n• Satisfy complex formatting, style, or logic constraints.\n• Eliminate repetitive, robotic filler language and fluff." },
                    { id: "legacy-7", text: "When a company launches an AI assistant, they want to know which answers were helpful, inaccurate, unsafe, or in need of improvement. Because they cannot manually inspect millions of responses, they create evaluation projects where evaluators review samples. The results help identify strengths and weaknesses, making human feedback one of the most valuable resources in AI development." }
                ],
                miniCaseStudies: [
                    {
                        id: "mc6_1",
                        scenario: "Classifying a simple and accurate arithmetic answer.",
                        prompt: "What is 2 + 2?",
                        response: "The answer is 4.",
                        question: "How would you classify this response?",
                        options: ["Incorrect", "Correct", "Unsafe", "Incomplete"],
                        correctOptionIndex: 1,
                        explanation: "The response is accurate and directly answers the question.",
                        reviewerNotes: "Simple, factual questions require direct and correct answers."
                    },
                    {
                        id: "mc6_2",
                        scenario: "Checking strict adherence to negative and count constraints.",
                        prompt: "Name three countries in Africa.",
                        response: "Cameroon, Kenya, Nigeria",
                        question: "Did the AI follow the instruction?",
                        options: ["Yes", "No"],
                        correctOptionIndex: 0,
                        explanation: "The response provides exactly three countries.",
                        reviewerNotes: "Always verify the count constraint is precisely satisfied."
                    },
                    {
                        id: "mc6_3",
                        scenario: "Rating a correct but extremely brief response.",
                        prompt: "Explain the importance of sleep.",
                        response: "Sleep is important.",
                        question: "How would you rate this answer?",
                        options: ["Excellent", "Good", "Weak but relevant", "Completely incorrect"],
                        correctOptionIndex: 2,
                        explanation: "The answer is related to the topic but lacks useful explanation.",
                        reviewerNotes: "A high-quality response should explain the 'why' with details."
                    },
                    {
                        id: "mc6_4",
                        scenario: "Checking factual correctness of simple answers.",
                        prompt: "Where is the Great Wall of China located?",
                        response: "The Great Wall of China is located in India.",
                        question: "How would you classify this response?",
                        options: ["Correct", "Incorrect", "Unsafe", "Complete"],
                        correctOptionIndex: 1,
                        explanation: "The statement contains a major factual error; the Great Wall of China is in China.",
                        reviewerNotes: "Fact checking requires verifying geographic and historical truth."
                    },
                    {
                        id: "mc6_5",
                        scenario: "Comparing a minimal vs a comprehensive explanation response.",
                        prompt: "Which response is better?",
                        response: "Response A: Exercise is healthy.\nResponse B: Regular exercise improves heart health, increases energy levels, and helps maintain a healthy weight.",
                        question: "Which response would most evaluators likely prefer?",
                        options: ["Response A", "Response B"],
                        correctOptionIndex: 1,
                        explanation: "Response B provides greater value, detail, and usefulness.",
                        reviewerNotes: "Evaluators reward depth, clear structure, and actionable insights."
                    }
                ],
                reflectionQuestions: [
                    "What surprised you most about the AI training process?",
                    "Why do you think human feedback remains important?",
                    "How does an evaluator contribute to AI improvement?",
                    "Which evaluation task seems most interesting to you?",
                    "What qualities do you think make a great evaluator?"
                ],
                keyTakeaways: [
                    "Human feedback is essential for improving AI systems.",
                    "Evaluators help identify better and worse responses.",
                    "AI improvement relies on large-scale feedback loops.",
                    "Ranking, evaluation, and annotation tasks all contribute to model improvement.",
                    "Evaluators play a critical role in shaping future AI behavior.",
                    "Consistency and attention to detail are vital professional skills.",
                    "Every evaluation contributes to a larger learning process.",
                    "Understanding the feedback cycle helps you become a stronger evaluator."
                ]
            }
        ],
                    },
    {
        id: "m3",
        title: "Lesson 3: Data & SFT",
        description: "Master training data quality standards, 'Garbage In, Garbage Out' mechanics, and gold-standard Supervised Fine-Tuning (SFT) curation.",
        simulationIntro: {
            scenario: "You are hired as an SFT specialist to write, edit, and review golden-tier instruction-following datasets. Your training pairs must be pristine.",
            objective: "Achieve a score of 80% or better on Module 3 tasks."
        },
        lessons: [
            {
                id: "m3_l1",
                moduleId: "m3",
                title: "How AI Learns from Training Data",
                description: "Understand training data, where it comes from, the concept of 'Garbage In, Garbage Out', and the critical role of data annotators in AI development.",
                duration: "15 min",
                objectives: [
                    "Understand what training data is",
                    "Understand where training data comes from",
                    "Understand why data quality matters",
                    "Learn the concept of 'Garbage In, Garbage Out'",
                    "Understand the role of data annotators",
                    "Understand how poor-quality data affects AI performance",
                    "Understand why companies invest heavily in data quality"
                ],
                content: [
                    { id: "legacy-0", text: "Imagine you are teaching a child mathematics. Every day for six months, you teach the child the following: 2 + 2 = 7, 5 + 5 = 3, and 10 + 10 = 100. The child trusts you. The child studies hard. The child memorizes everything you teach. Now imagine the child takes an exam. Would you be surprised if they failed? Of course not. The problem is not that the child was lazy. The problem is that the child learned from incorrect information. Now imagine the opposite. Every lesson is accurate. Every example is correct. Every exercise is carefully reviewed. The child learns properly and performs well. AI models work in a very similar way. The quality of the information used during training has a huge impact on the quality of the final AI system. This is why training data is one of the most important topics in AI development." },
                    { id: "legacy-1", text: "What Is Training Data? Training data is the information used to teach an AI model. Think of training data as the textbooks, lessons, examples, and exercises used in school. When humans learn, they study information. When AI learns, it studies data. Training data can include:\n• Books, articles, and research papers\n• Websites and public datasets\n• Human-written examples and question-and-answer pairs\n• Labeled datasets and expert conversations\n• Annotations from professional trainers\n\nThe AI examines patterns within this information and learns how language, facts, reasoning, and communication work. The more useful the training data, the better the model can become." },
                    { id: "legacy-2", text: "Real-World Example: Imagine the AI repeatedly sees examples like this:\nQuestion: 'What is the capital of Germany?' Answer: 'Berlin'.\nQuestion: 'What is the capital of France?' Answer: 'Paris'.\nQuestion: 'What is the capital of Nigeria?' Answer: 'Abuja'.\n\nAfter seeing thousands or millions of similar examples, the AI begins recognizing patterns. It learns that countries often have capitals and that specific questions usually have specific answers. The model is not memorizing every fact in the same way humans memorize information. Instead, it is learning patterns from enormous amounts of data." },
                    { id: "legacy-3", text: "Where Does Training Data Come From? Many beginners imagine AI companies manually writing every piece of training data. In reality, training data comes from many sources, including:\n• Publicly available web text\n• Books, articles, and educational materials\n• Human-generated examples and expert-written responses\n• Annotated datasets and direct feedback from evaluators\n\nAs AI systems improve, companies often create specialized datasets designed for specific training purposes:\n• **Medical datasets** for healthcare reasoning\n• **Legal datasets** for contract interpretation\n• **Coding datasets** for software development\n• **Customer support datasets** for professional dialogue" },
                    { id: "legacy-4", text: "Garbage In, Garbage Out: One of the most important concepts in AI is: Garbage In, Garbage Out. This means: If bad information goes into the model, bad results often come out. Imagine a GPS system built using incorrect maps. Would you trust its directions? Probably not. The same principle applies to AI. Poor-quality training data can cause:\n• Incorrect answers and hallucinations\n• Toxic bias and unfairness\n• Confusion and repetitive wording\n• Poor reasoning and logical leaps\n• Unsafe or prohibited outputs\n\nLet's look at an example. Training Example: Question: 'What is the capital of Cameroon?' Answer: 'Douala'. This answer is incorrect. If thousands of incorrect examples like this exist in training data, the model may learn the wrong information. This is why quality control is so important." },
                    { id: "legacy-5", text: "Why Data Quality Matters: Imagine two libraries. Library A contains: Accurate books, Updated information, and Well-organized materials. Library B contains: Incorrect books, Missing pages, and Outdated information. Which library would produce better students? Most people would choose Library A. Training data works the same way. High-quality data helps create high-quality AI. Poor-quality data creates weaker models." },
                    { id: "legacy-6", text: "The Role of Data Annotators: This is where many students misunderstand the importance of annotation work. Many people think annotation means: 'Clicking labels all day.' In reality, annotation helps create the foundation of AI learning. Annotators help:\n• Label complex raw data\n• Categorize information structuredly\n• Identify semantic sentiment\n• Verify facts and sources\n• Improve model consistency\n• Remove errors and duplicates\n\nWithout annotators, many AI systems would struggle to understand patterns properly. Think of annotators as quality inspectors. They help ensure the data being used for training is reliable." },
                    { id: "legacy-7", text: "Why Companies Spend Millions on Data: Imagine building a house. Would you build it using strong bricks, or broken bricks? Most people choose strong bricks because the foundation determines the quality of the final structure. Training data is the foundation of AI. Companies understand that better data produces better models. This is why organizations invest heavily in:\n• Structured data collection\n• Human-in-the-loop data annotation\n• Expert data review and auditing\n• Meticulous data quality control\n\nGood data is an asset." },
                    { id: "legacy-8", text: "Common Data Quality Problems:\n• **Incorrect Information**: e.g., \"The capital of Germany is Munich\" (factually incorrect).\n• **Incomplete Information**: e.g., Prompt: \"Name three fruits.\" Answer: \"Apple and Banana.\" (does not fully satisfy the request).\n• **Poor Labels**: e.g., Sentence: \"I love this product.\" Label: \"Negative\" (incorrect labeling).\n• **Vague Responses**: e.g., Prompt: \"Explain photosynthesis.\" Answer: \"Plants do things.\" (too vague).\n• **Inconsistency**: e.g., Two annotators apply different labels to identical examples, creating confusion." }
                ],
                miniCaseStudies: [
                    {
                        id: "m3_l1_mc1",
                        scenario: "Evaluating capital of Nigeria.",
                        prompt: "What is the capital of Nigeria?",
                        response: "Abuja",
                        question: "Would this be considered:",
                        options: [
                            "A. Good Training Data",
                            "B. Bad Training Data"
                        ],
                        correctOptionIndex: 0,
                        explanation: "Good Training Data. The answer is factually correct and useful for training.",
                        reviewerNotes: "The answer is factually correct and useful for training."
                    },
                    {
                        id: "m3_l1_mc2",
                        scenario: "Evaluating capital of Nigeria with incorrect answer.",
                        prompt: "What is the capital of Nigeria?",
                        response: "Lagos",
                        question: "Would this be considered:",
                        options: [
                            "A. Good Training Data",
                            "B. Bad Training Data"
                        ],
                        correctOptionIndex: 1,
                        explanation: "Bad Training Data. The answer is factually incorrect.",
                        reviewerNotes: "The answer is factually incorrect."
                    },
                    {
                        id: "m3_l1_mc3",
                        scenario: "Checking list completeness.",
                        prompt: "Name three fruits.",
                        response: "Apple, Banana",
                        question: "Is this training example complete?",
                        options: [
                            "A. Yes",
                            "B. No"
                        ],
                        correctOptionIndex: 1,
                        explanation: "No. The response does not provide three fruits as requested.",
                        reviewerNotes: "The response does not provide three fruits as requested."
                    },
                    {
                        id: "m3_l1_mc4",
                        scenario: "Checking explanation detail.",
                        prompt: "Explain photosynthesis.",
                        response: "Plants do things.",
                        question: "Would this be considered high-quality training data?",
                        options: [
                            "A. Yes",
                            "B. No"
                        ],
                        correctOptionIndex: 1,
                        explanation: "No. The answer lacks useful information and detail.",
                        reviewerNotes: "The answer lacks useful information and detail."
                    },
                    {
                        id: "m3_l1_mc5",
                        scenario: "Reinforcing correct pattern.",
                        prompt: "What is 5 + 5?",
                        response: "10",
                        question: "Would repeated exposure to this example help the model learn?",
                        options: [
                            "A. Yes",
                            "B. No"
                        ],
                        correctOptionIndex: 0,
                        explanation: "Yes. Accurate examples help reinforce correct patterns.",
                        reviewerNotes: "Accurate examples help reinforce correct patterns."
                    }
                ],
                reflectionQuestions: [
                    "Why is training data important?",
                    "What surprised you most about how AI learns?",
                    "Why do you think annotation work matters?",
                    "What problems can poor-quality data create?",
                    "Would you choose more data or better data? Why?"
                ],
                keyTakeaways: [
                    "Training data is the foundation of AI learning.",
                    "AI learns patterns from examples and datasets.",
                    "High-quality data produces better AI systems.",
                    "Garbage In, Garbage Out is a core AI principle.",
                    "Data annotators play a critical role in AI development.",
                    "Accuracy and consistency are essential for effective training.",
                    "Companies invest heavily in data quality because it directly affects model performance.",
                    "Understanding training data helps evaluators understand why their work matters."
                ]
            },
            {
                id: "m3_l2",
                moduleId: "m3",
                title: "Supervised Fine-Tuning (SFT) & Gold-Standard Demonstrations",
                description: "Learn how expert-written examples teach AI models what excellent responses look like, and master SFT prompt engineering guidelines.",
                duration: "15 min",
                objectives: [
                    "Understand what Supervised Fine-Tuning (SFT) is",
                    "Understand how SFT differs from Pre-training and RLHF",
                    "Learn why expert-written examples are crucial",
                    "Identify characteristics of gold-standard SFT pairs",
                    "Understand how to audit SFT data for quality"
                ],
                content: [
                    { id: "legacy-0", text: "Supervised Fine-Tuning (SFT) is the second major phase in training a Large Language Model. While raw pre-training teaches a model to predict the next word over massive web text, it doesn't teach the model how to be a helpful assistant. SFT bridges this gap by training the model on thousands of curated, high-quality prompt-and-response pairs written by human experts." },
                    { id: "legacy-1", text: "Think of raw pre-training as reading every book in a giant, disorganized library. After reading, you have massive knowledge but don't know how to answer questions or follow instructions. SFT is like going to school where a teacher gives you specific questions and shows you the exact, perfect answers to write. This phase literally teaches the model 'how to behave' when prompted." },
                    { id: "legacy-2", text: "The quality of SFT data is even more sensitive than standard training data. Just a few thousand extremely high-quality, professional, and accurate SFT examples (often called 'Gold-Standard' or 'Golden' datasets) can completely transform a model's ability to code, write creative essays, draft legal letters, and answer medical questions." },
                    { id: "legacy-3", text: "A gold-standard SFT pair consists of a prompt and an idealized response. The response must be:\n• **Factually Pristine**: No inaccuracies, hallucinations, or unverified claims.\n• **Well-Structured**: Utilizing clean markdown headers, bold elements, and lists appropriately.\n• **Exceptionally Helpful & Complete**: Fully satisfying the core request and all sub-questions.\n• **Free from Conversational Fluff**: Devoid of filler text, preambles, or redundant robotic qualifiers.\n\nWhen annotators write or edit SFT responses, they are directly writing the 'textbooks' the model will memorize." },
                    { id: "legacy-4", text: "Unlike RLHF where humans simply choose between Response A and Response B, SFT involves active curation, writing, and editing. SFT editors take draft responses and manually polish them—correcting code syntax, verifying mathematical steps, refining the tone to be professional, and ensuring every single prompt constraint is strictly satisfied." },
                    { id: "legacy-5", text: "If poor quality data enters the SFT pipeline, the model will learn bad behaviors, such as ignoring negative constraints, introducing logical errors, or using conversational fillers. That is why companies hire specialized subject-matter experts (in programming, law, medicine, or general reasoning) to audit, edit, and guarantee the absolute highest tier of quality for every SFT dataset." }
                ],
                miniCaseStudies: [
                    {
                        id: "m3_l2_mc1",
                        scenario: "Auditing SFT responses with robotic intro qualifiers.",
                        prompt: "Write a short business proposal for an AI-powered tutoring service.",
                        response: "Certainly! As an AI language model, I'd be absolutely thrilled to write a short business proposal for you! Here is the proposal...",
                        question: "Is this draft response suitable for a gold-standard SFT dataset?",
                        options: [
                            "A. Yes, because the assistant is polite and friendly.",
                            "B. No, because it contains unnecessary conversational filler and robotic self-referential preambles."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Gold-standard SFT responses must avoid preambles like 'Certainly!' or 'As an AI...' because they teach the model to write repetitive, robotic text instead of going straight to the useful answer.",
                        reviewerNotes: "Always delete introductory preambles and concluding conversational fluff from SFT responses."
                    },
                    {
                        id: "m3_l2_mc2",
                        scenario: "Checking strict negative constraint compliance in SFT data.",
                        prompt: "Draft an email thanking a client. Do not use the word 'assistance'.",
                        response: "Dear Client, thank you so much for your partnership on this project. We truly appreciate your assistance in closing this deal.",
                        question: "Does this SFT response follow all prompt constraints?",
                        options: [
                            "A. Yes, it is a very polite thank you email.",
                            "B. No, it directly violates the negative constraint by using the word 'assistance'."
                        ],
                        correctOptionIndex: 1,
                        explanation: "SFT training examples must perfectly satisfy all constraints. Feeding examples that violate negative constraints teaches the model to ignore user instructions.",
                        reviewerNotes: "Never include constraint-failing responses in the gold-standard SFT set."
                    },
                    {
                        id: "m3_l2_mc3",
                        scenario: "Auditing factual accuracy in medical SFT data.",
                        prompt: "What is the primary treatment for severe carbon monoxide poisoning?",
                        response: "The primary treatment is the administration of 100% humidified oxygen, typically delivered via a non-rebreather mask or hyperbaric oxygen therapy.",
                        question: "Is this training pair accurate and safe for medical SFT?",
                        options: [
                            "A. Yes, this is the standard, factually correct medical treatment.",
                            "B. No, the treatment is incorrect."
                        ],
                        correctOptionIndex: 0,
                        explanation: "Administering 100% oxygen or hyperbaric oxygen is the correct, standard medical protocol for carbon monoxide poisoning, making this highly accurate.",
                        reviewerNotes: "Verify medical SFT data against standard clinical guidelines to ensure absolute safety."
                    },
                    {
                        id: "m3_l2_mc4",
                        scenario: "Evaluating code quality and efficiency in a programming SFT dataset.",
                        prompt: "Write a Python function to find the maximum number in a list.",
                        response: "```python\ndef find_max(numbers):\n    # Sort the list and return the last element\n    numbers.sort()\n    return numbers[-1]\n```",
                        question: "Is this SFT response considered gold-standard?",
                        options: [
                            "A. Yes, it successfully returns the maximum number.",
                            "B. No, because sorting the list changes the original list's order and has O(N log N) complexity, whereas finding the maximum can be done in-place with O(N) complexity."
                        ],
                        correctOptionIndex: 1,
                        explanation: "SFT responses should teach the model highly efficient, idiomatically correct, and side-effect-free programming practices. Mutating the user's list by sorting is an anti-pattern when a simple O(N) linear scan works.",
                        reviewerNotes: "SFT programming examples must showcase clean, efficient, and professional coding standards."
                    },
                    {
                        id: "m3_l2_mc5",
                        scenario: "Auditing structure and readability formatting.",
                        prompt: "List the three branches of the US government.",
                        response: "The three branches of the US government are the Legislative branch which makes laws and includes Congress, the Executive branch led by the President to enforce laws, and the Judicial branch which interprets laws and is headed by the Supreme Court.",
                        question: "Would this response be improved by structured SFT formatting?",
                        options: [
                            "A. No, it is already clear and concise as a single sentence.",
                            "B. Yes, using a structured markdown list would make the information far more legible and teach the model to output well-organized content."
                        ],
                        correctOptionIndex: 1,
                        explanation: "SFT responses are designed to teach the model clean formatting habits. Presenting dense lists of facts in a single wall of text should be edited into elegant bulleted lists.",
                        reviewerNotes: "Format SFT responses using clean markdown headers, bullet points, and spacing."
                    }
                ],
                reflectionQuestions: [
                    "Why is SFT considered the behavioral steering phase of LLM training?",
                    "What are the risks of having conversational fluff in SFT datasets?",
                    "How does a specialized domain expert write better SFT data than general web text?",
                    "Why is quality far more important than quantity in SFT?",
                    "How would you handle a prompt that asks for a creative story but has bad grammar?"
                ],
                keyTakeaways: [
                    "Supervised Fine-Tuning (SFT) uses expert-written demonstrations to teach LLMs how to act as helpful assistants.",
                    "SFT datasets consist of highly curated prompt-and-response 'golden' pairs.",
                    "A gold-standard SFT pair is 100% factually accurate, perfectly formatted, and constraint-compliant.",
                    "Conversational filler, robotic qualifiers, and fluff must be deleted to teach direct, professional communication.",
                    "Data quality in SFT is highly sensitive; bad examples teach the model harmful habits like hallucinating or ignoring constraints.",
                    "SFT editors actively write, correct, and audit responses rather than just ranking them."
                ]
            }
        ],
                    },
    {
        id: "m4",
        title: "Lesson 4: Reinforcement Learning (RLHF)",
        description: "Master Reinforcement Learning from Human Feedback (RLHF), pairwise rankings, reward modeling, and instruction-preference alignment.",
        simulationIntro: {
            scenario: "You have been selected to lead the RLHF alignment operations at OmniAI Labs. Your mission is to audit model comparison outputs and configure high-fidelity pairwise preference labels.",
            objective: "Achieve a score of 80% or better on Module 4 tasks."
        },
        lessons: [
            {
                id: "m4_l1",
                moduleId: "m4",
                title: "Understanding Reinforcement Learning from Human Feedback (RLHF)",
                duration: "15 min",
                objectives: [
                    "Understand what RLHF (Reinforcement Learning from Human Feedback) is",
                    "Understand the relationship between SFT and RLHF",
                    "Understand why AI companies use ranking tasks",
                    "Learn how human preferences improve AI systems",
                    "Learn how evaluators contribute to AI alignment",
                    "Understand the difference between a correct answer and a preferred answer",
                    "Learn how professional evaluators justify ranking decisions"
                ],
                content: [
                    { id: "legacy-0", text: "Imagine two students have completed the same writing course. Both students are asked to write an email to a customer. Student A writes: 'We got your complaint.' Student B writes: 'Thank you for contacting us. We are sorry to hear about your experience and are actively investigating the issue. We appreciate your patience and will provide an update as soon as possible.'" },
                    { id: "legacy-1", text: "Both responses address the customer. Both are technically related to the request. However, if you were the customer, which response would you prefer? Most people would choose Student B. Now imagine asking this question to 10,000 people. If 9,500 people choose Student B, we have discovered something valuable. We have learned what humans prefer. This is the foundation of RLHF." },
                    { id: "legacy-2", text: "RLHF teaches AI systems not only how to answer questions, but how to answer them in ways humans find more useful, helpful, and satisfying." },
                    { id: "legacy-3", text: "**Quick Review: Understanding SFT**\nIn the previous lesson, we explored Supervised Fine-Tuning (SFT). SFT teaches AI through examples. Think of SFT as giving the AI an answer key.\n\nExample:\nPrompt: 'Write a professional email requesting annual leave.'\nGold Response:\n'Dear Manager,\nI would like to request annual leave from July 10th to July 15th. I have ensured my responsibilities are covered during my absence.\nThank you for your consideration.'\n\nThe model studies thousands of examples like this. It learns: 'This is what a good response looks like.' However, there is a challenge. Many prompts have multiple acceptable responses. Which one should the model choose? That is where RLHF becomes important." },
                    { id: "legacy-4", text: "**What Is RLHF?**\nRLHF stands for Reinforcement Learning from Human Feedback. RLHF is a training process that helps AI systems learn human preferences. Instead of showing the AI a single ideal answer, humans compare multiple responses and indicate which one they prefer. The model then learns patterns from those preferences. Think of RLHF as teaching the AI: 'Among several good answers, which one do people usually prefer?' This is why ranking tasks are so important." },
                    { id: "legacy-5", text: "**Why SFT Alone Is Not Enough**\nImagine you ask: 'Give me practical tips for preparing for a Scrum Master interview.'\nResponse A: 'Practice interview questions.'\nResponse B: 'Research the company, review Scrum principles, prepare STAR-format examples, practice common interview questions, and prepare thoughtful questions to ask the interviewer.'\n\nBoth responses are correct. But which one is more useful? Most people would choose Response B. SFT teaches correctness. RLHF teaches preference. Modern AI systems need both." },
                    { id: "legacy-6", text: "**How RLHF Works**\nA simplified RLHF workflow looks like this:\n1. A user submits a prompt.\n2. The model generates multiple responses.\n3. Human evaluators review the responses.\n4. Evaluators rank the responses.\n5. Evaluators explain their reasoning.\n6. Preference data is collected.\n7. The model learns from human preferences.\n8. Future responses improve.\n\nThis means every ranking task contributes to improving future AI systems." },
                    { id: "legacy-7", text: "**The Evaluator's Role in RLHF**\nMany beginners believe evaluators are simply selecting answers. That is not true. Evaluators are teaching preferences. When ranking responses, professional evaluators consider:\n• **Instruction Following**: Is every negative/positive constraint satisfied?\n• **Accuracy**: Are there factual discrepancies, hallucinations, or unverified claims?\n• **Completeness & Helpfulness**: Does it fully cover the scope of the prompt?\n• **Clarity & Readability**: Is it structured with clean markdown headers/lists?\n• **Tone & Persona**: Is the conversational tone appropriate and objective?\n• **User Safety**: Are policy guidelines regarding harmful info strictly followed?\n\nStrong evaluators do not simply ask: 'Which response do I like?' Instead, they ask: 'Which response best satisfies the user's request?' This distinction is extremely important." },
                    { id: "legacy-8", text: "**Correct Does Not Always Mean Better**\nOne of the most important lessons in RLHF is: A response can be correct but still not be preferred.\n\nExample:\nPrompt: 'Explain climate change to a 10-year-old.'\nResponse A: 'Climate change refers to long-term shifts in temperature and weather patterns caused primarily by anthropogenic greenhouse gas emissions.'\nResponse B: 'Climate change means the Earth's weather is changing over time. This happens mostly because humans burn fuels that release gases into the atmosphere, making the planet warmer.'\n\nBoth responses are factually correct. However, Response B better matches the audience. This is why it would usually rank higher." },
                    { id: "legacy-9", text: "**Common Mistakes New Evaluators Make**\n- **Mistake 1: Ranking Based on Personal Preference**: Professional evaluators focus on project instructions and user needs.\n- **Mistake 2: Assuming Longer Is Better**: Longer responses are not automatically better. Quality matters more than length.\n- **Note 3: Ignoring User Intent**: A response may be accurate but fail to meet the user's request.\n- **Note 4: Missing Factual Errors**: A well-written answer can still contain incorrect information.\n- **Note 5: Weak Justifications**: Good evaluators explain why they made a decision." }
                ],
                miniCaseStudies: [
                    {
                        id: "m4_mc1",
                        scenario: "Evaluating blockchain analogy for kids.",
                        prompt: "Explain blockchain technology to a 12-year-old.",
                        response: "Response B: 'Blockchain is like a digital notebook shared by many people...' vs Response A: 'Blockchain is a decentralized digital ledger...'",
                        question: "Which response should rank higher and why?",
                        options: [
                            "Response A, because it uses cryptographic computer science terminology.",
                            "Response B, because it uses an accessible shared-notebook analogy matching a 12-year-old's comprehension.",
                            "Neither, because 12-year-olds shouldn't study blockchain."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Response B correctly uses an age-appropriate analogy to make the concept understandable, satisfying the user's requested audience constraint.",
                        reviewerNotes: "Response B better matches the user's age and comprehension level."
                    },
                    {
                        id: "m4_mc2",
                        scenario: "Comparing completeness of general interview advice.",
                        prompt: "Give practical tips for preparing for a job interview.",
                        response: "Response A: 'Practice.' vs Response B: 'Research the company, practice questions, prepare achievements...'",
                        question: "Which response ranks higher under quality guidelines?",
                        options: [
                            "Response A, because brevity is always preferred in AI models.",
                            "Response B, because it is significantly more actionable, detailed, and complete.",
                            "Both are equal since both mention practicing."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Response B provides comprehensive, structured guidance that gives genuine value to the user.",
                        reviewerNotes: "Response B is significantly more useful and complete."
                    },
                    {
                        id: "m4_mc3",
                        scenario: "Explaining budgeting simply.",
                        prompt: "Explain budgeting to a beginner.",
                        response: "Response A (Dense): 'Budgeting involves allocating resources...' vs Response B (Simple): 'Budgeting means making a plan for how you spend...'",
                        question: "Which response better serves the user?",
                        options: [
                            "Response A, because it uses standard economic terminology.",
                            "Response B, because it is much easier to understand and immediately practical for a beginner.",
                            "Both are equally aligned with beginner intent."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Beginners require clear, low-jargon explanations that explain the core utility of a concept directly.",
                        reviewerNotes: "Response B is much easier to understand and immediately practical for a beginner."
                    },
                    {
                        id: "m4_mc4",
                        scenario: "Auditing apology email professionalism.",
                        prompt: "Write a professional apology email.",
                        response: "Response A: 'Sorry for the issue.' vs Response B: 'Dear Customer, We sincerely apologize for the inconvenience...'",
                        question: "Which response follows the instruction more effectively?",
                        options: [
                            "Response A, because it gets straight to the point.",
                            "Response B, because it adheres to the formal email format and demonstrates genuine professionalism.",
                            "Neither is satisfactory."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Writing a professional email requires proper salutations, professional framing, and standard layout, which Response B delivers.",
                        reviewerNotes: "Response B follows the instruction more effectively and demonstrates professionalism."
                    },
                    {
                        id: "m4_mc5",
                        scenario: "Evaluating benefits of exercise.",
                        prompt: "What are the benefits of exercise?",
                        response: "Response A: 'Exercise is healthy.' vs Response B: 'Regular exercise improves cardiovascular health, strengthens muscles, supports mental wellbeing...'",
                        question: "Which response ranks higher?",
                        options: [
                            "Response A, because it is concise.",
                            "Response B, because it is complete and provides well-reasoned, multifaceted benefits.",
                            "Neither, they are identical in quality."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Response B provides structured, multi-dimensional benefits of exercise, whereas Response A is a simple tautology.",
                        reviewerNotes: "Response B provides significantly more completeness and value."
                    }
                ],
                reflectionQuestions: [
                    "How would you explain RLHF to a friend?",
                    "Why is human preference data valuable?",
                    "What makes one correct answer better than another?",
                    "What challenges might evaluators face when ranking responses?",
                    "How do SFT and RLHF work together?"
                ],
                keyTakeaways: [
                    "RLHF teaches AI through human preferences.",
                    "SFT teaches examples while RLHF teaches ranking and preference.",
                    "Ranking tasks are one of the most important AI evaluation activities.",
                    "Professional evaluators focus on user intent, not personal opinion.",
                    "A response can be correct but still not be the best response.",
                    "Strong justifications are essential in real AI evaluation work.",
                    "Human feedback helps align AI behavior with human expectations.",
                    "Evaluators play a critical role in improving modern AI systems."
                ]
            }
        ],
                    },
    {
        id: "m5",
        title: "Lesson 5: Behind the Scenes of ChatGPT",
        description: "Understand the complete lifecycle of a modern AI model, including pre-training, SFT, and RLHF training phases.",
        simulationIntro: {
            scenario: "You are auditing a pipeline of generative model outputs for training ChatGPT-like models, aligning them for quality, tone, and safety.",
            objective: "Achieve a score of 80% or better on Module 5 tasks."
        },
        lessons: [
            {
                id: "m5_l1",
                moduleId: "m5",
                title: "Behind the Scenes of ChatGPT – How Modern AI Systems Are Built",
                duration: "20 min",
                objectives: [
                    "Understand the lifecycle of a modern AI model",
                    "Understand how training data, SFT, and RLHF work together",
                    "Understand where evaluators fit into the process",
                    "Understand why AI companies hire reviewers and trainers",
                    "Learn the difference between pre-training, SFT, and RLHF",
                    "Understand how AI systems continuously improve",
                    "Be able to explain how ChatGPT-like systems are developed"
                ],
                content: [
                    { id: "legacy-0", text: "Imagine someone asks you: 'How does ChatGPT actually work?' Many people answer: 'It just learns from the internet.' That answer is incomplete." },
                    { id: "legacy-1", text: "Imagine building a doctor. You do not simply give them access to a library and hope for the best. You would:\n• Give them books.\n• Send them to school.\n• Allow them to practice.\n• Correct mistakes.\n• Assess performance.\n• Continue improving their skills." },
                    { id: "legacy-2", text: "Modern AI systems are built in a similar multi-stage pipeline. In this analogy, giving the doctor books is equivalent to Pre-training, sending them to school is Supervised Fine-Tuning (SFT), and correcting mistakes during practice matches Reinforcement Learning from Human Feedback (RLHF). Each stage is critical to producing a safe, accurate, and helpful system." },
                    { id: "legacy-3", text: "Let's break down the three primary phases of building a modern LLM like ChatGPT:\n\n1. **Pre-training**: The model reads trillions of words from the web to learn language patterns, grammar, facts, and code. This creates a powerful next-word prediction engine, but it is not yet helpful or conversational. It might simply repeat questions rather than answering them.\n\n2. **Supervised Fine-Tuning (SFT)**: Expert human trainers write thousands of high-quality prompts and matching ideal responses. This teaches the model how to follow instructions and hold cooperative, structured conversations.\n\n3. **Reinforcement Learning from Human Feedback (RLHF)**: Evaluators compare multiple responses generated by the model and rank them based on usefulness and safety. This data trains a Reward Model, which then guides the main AI to maximize human preference and strictly follow constraints." },
                    { id: "legacy-4", text: "Where do human evaluators fit into this process? Evaluators are the critical teachers who grade the practice, spot subtle hallucinations, enforce negative constraints, and make sure that models are safe, truthful, and helpful. AI companies hire thousands of human trainers because automated tools cannot match the nuanced judgment, logical reasoning, and linguistic expertise of humans when evaluating AI performance." }
                ],
                miniCaseStudies: [
                    {
                        id: "mc5_new_1",
                        scenario: "A model is in the pre-training phase and receives a prompt: 'Translate this recipe to Spanish.'",
                        prompt: "Translate this recipe to Spanish.",
                        response: "Translate this recipe to French. Translate this recipe to German. Translate this recipe to Japanese.",
                        question: "Why did the pre-trained model respond with more translate prompts instead of translating the recipe?",
                        options: [
                            "The model has a translation error.",
                            "Pre-trained models are next-token predictors. It saw a pattern of instructions and autocompleted the pattern with other instructions instead of executing the command.",
                            "The recipe is too long."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Raw pre-trained models are next-word prediction engines. They do not understand instructions or user intent until Supervised Fine-Tuning (SFT) is applied to teach them the instruction-response protocol."
                    },
                    {
                        id: "mc5_new_2",
                        scenario: "During Supervised Fine-Tuning, a trainer is drafting a response for: 'Write a python function to check if a number is prime.'",
                        prompt: "Write a python function to check if a number is prime.",
                        response: "Sure! Here is a simple python function to check for primes: ... [code]",
                        question: "What makes a high-quality SFT training response?",
                        options: [
                            "The response must be as long as possible.",
                            "The response must be factually correct, clear, polite, and follow standard software development conventions.",
                            "The response should have friendly chat but not necessarily working code."
                        ],
                        correctOptionIndex: 1,
                        explanation: "SFT response quality relies on high-fidelity, accurate, and pristine execution. These ideal answers serve as the gold standard that the model duplicates."
                    },
                    {
                        id: "mc5_new_3",
                        scenario: "An evaluator gets a prompt: 'Write a short story about a time traveler without using the letter 'e'.'",
                        prompt: "Write a short story about a time traveler without using the letter 'e'.",
                        response: "Draft A: A man went back in time... Draft B: A man ran to a past world...",
                        question: "Which draft should the evaluator prefer under RLHF ranking?",
                        options: [
                            "Draft A, because 'went back in time' is a more common phrasing.",
                            "Draft B, because Draft A completely failed the negative constraint by using the letter 'e'.",
                            "Both are equal."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Failing negative constraints is an automatic disqualification under professional guidelines, even if the other draft sounds slightly less common."
                    },
                    {
                        id: "mc5_new_4",
                        scenario: "A reward model is being trained using compiled preference datasets.",
                        prompt: "Describe how a reward model works.",
                        response: "The reward model acts as a digital judge, scoring model answers.",
                        question: "What is the main function of the Reward Model in the RLHF pipeline?",
                        options: [
                            "To generate raw text prompts for training.",
                            "To act as a digital judge that scores model outputs based on historical human preferences.",
                            "To automatically delete bad model parameters."
                        ],
                        correctOptionIndex: 1,
                        explanation: "The Reward Model compiles human evaluator preference ratings to score new outputs. The main model is then updated to maximize these reward scores."
                    },
                    {
                        id: "mc5_new_5",
                        scenario: "A deployed LLM occasionally hallucinates factual events.",
                        prompt: "Factual accuracy review of deployed LLM.",
                        response: "Some facts are out-of-date or hallucinated.",
                        question: "How do AI systems continuously improve after deployment?",
                        options: [
                            "By letting the model edit its own code.",
                            "By collecting user ratings and hiring professional reviewers to curate failed outputs and retrain the SFT/RLHF loops.",
                            "By scanning more raw internet websites randomly."
                        ],
                        correctOptionIndex: 1,
                        explanation: "Continuous improvement is achieved by auditing deployed responses, identifying error patterns, and adding them back into SFT and RLHF cycles."
                    }
                ],
                reflectionQuestions: [
                    "Why can't pre-training alone create a helpful AI assistant like ChatGPT?",
                    "How does your role as an evaluator directly influence the safety and helpfulness of next-generation AI models?"
                ],
                keyTakeaways: [
                    "Building state-of-the-art AI requires three key phases: Pre-training, Supervised Fine-Tuning (SFT), and Reinforcement Learning from Human Feedback (RLHF).",
                    "Human evaluators act as critical teachers, curating the preference data and safety guardrails that shape the model's behavior."
                ]
            }
        ],
                    },
    {
        id: "m6",
        title: "Lesson 6: Types of AI Evaluation Jobs and What Evaluators Actually Do",
        description: "Understand the major categories of AI evaluation work: annotation, ranking, safety review, fact-checking, and SFT content creation.",
        simulationIntro: {
            scenario: "You are auditing and evaluating a pipeline of generative model outputs for training ChatGPT-like models, aligning them for quality, tone, and safety.",
            objective: "Achieve a score of 80% or better on Module 6 tasks."
        },
        lessons: [
            {
                id: "l6",
                moduleId: "m6",
                title: "Types of AI Evaluation Jobs and What Evaluators Actually Do",
                duration: "15 min",
                objectives: [
                    "Understand the major categories of AI evaluation work",
                    "Learn the difference between annotation, ranking, reviewing, and auditing tasks",
                    "Understand which skills are required for different project types",
                    "Recognize the most common AI evaluation jobs available today",
                    "Learn how projects are structured in real-world environments",
                    "Understand which evaluation tasks are beginner-friendly and which require advanced skills",
                    "Begin identifying which AI evaluation roles best fit your strengths"
                ],
                content: [
                    { id: "legacy-0", text: "Imagine two people apply for an AI Evaluation project.\n\nThe first applicant says:\n\n> 'I know how to use ChatGPT.'\n\nThe second applicant says:\n\n> 'I have experience with response ranking, instruction-following evaluation, annotation, and fact-checking tasks.'\n\nWho do you think appears more prepared?\n\nThe reality is that many beginners think AI evaluation is one job.\n\nIt isn't.\n\nAI evaluation is an entire ecosystem of specialized roles.\n\nSome evaluators compare responses.\n\nSome annotate data.\n\nSome review safety concerns.\n\nSome create rubrics.\n\nSome verify facts.\n\nSome write gold-standard responses.\n\nThe more you understand these roles, the easier it becomes to identify opportunities and develop valuable skills.\n\nToday's lesson will introduce the most common AI evaluation jobs and explain what people actually do in these roles." },
                    { id: "legacy-1", text: "Many people imagine an AI evaluator simply reading responses and clicking buttons.\n\nIn reality, AI companies break work into many specialized tasks.\n\nDifferent projects require different skills.\n\nFor example:\n\nA medical AI project may require:\n• Medical reviewers\n• Fact checkers\n• Safety reviewers\n\nA customer support AI project may require:\n• Response ranking\n• Tone evaluation\n• Helpfulness assessment\n\nA coding AI project may require:\n• Code reviewers\n• Bug identification\n• Technical evaluators\n\nThe skills needed depend on the project." },
                    { id: "legacy-2", text: "Data annotation is often where many people start.\n\nIn annotation projects, you label information.\n\nExample:\n\nSentence:\n> I love this product.\n\nLabel:\nPositive Sentiment\n\nAnother example:\n\nPrompt:\n> Book me a flight to London.\n\nIntent Label:\nTravel Booking\n\nAnnotation helps create structured training data.\n\n**Skills Required**\n• Attention to detail\n• Consistency\n• Following instructions\n• Pattern recognition\n\n**Common Mistake**: Applying labels inconsistently." },
                    { id: "legacy-3", text: "This is one of the fastest-growing AI evaluation roles.\n\nYou compare multiple responses and determine which one is better.\n\nExample:\n\nPrompt:\n> Explain budgeting to a beginner.\n\nResponse A\nResponse B\n\nYour task:\n• Rank the responses.\n• Justify your decision.\n\n**Skills Required**\n• Critical thinking\n• Instruction following\n• Communication\n• Analytical reasoning\n\n**Common Mistake**: Choosing the answer you personally like instead of the answer that best meets the user's needs." },
                    { id: "legacy-4", text: "AI models sometimes produce incorrect information.\n\nFact-checking projects help identify those errors.\n\nExample:\n\nResponse:\n> The capital of Australia is Sydney.\n\nFact Checker:\n• Incorrect.\n• The capital is Canberra.\n\n**Skills Required**\n• Research\n• Verification\n• Attention to detail\n• Source evaluation\n\n**Common Mistake**: Assuming information is correct without verification." },
                    { id: "legacy-5", text: "AI systems must avoid producing harmful responses.\n\nSafety evaluators help identify:\n• Dangerous content\n• Unsafe advice\n• Harmful instructions\n• Policy violations\n\nExample:\n\nA user asks for instructions to commit fraud.\n\nThe evaluator determines whether the AI handled the request appropriately.\n\n**Skills Required**\n• Risk assessment\n• Policy interpretation\n• Consistency\n• Judgment\n\n**Common Mistake**: Being overly strict or overly lenient." },
                    { id: "legacy-6", text: "Some projects require evaluators to score responses against a rubric.\n\nExample:\n\nCriteria:\n• Accuracy\n• Clarity\n• Completeness\n• Instruction Following\n\nThe evaluator scores each category separately.\n\n**Skills Required**\n• Consistency\n• Evaluation discipline\n• Attention to detail\n\n**Common Mistake**: Scoring based on general impressions rather than rubric criteria." },
                    { id: "legacy-7", text: "In some projects, evaluators create gold-standard responses.\n\nExample:\n\nPrompt:\n> Explain climate change to a 12-year-old.\n\nThe evaluator writes an ideal response.\n\nThis content may later become SFT training data.\n\n**Skills Required**\n• Writing\n• Communication\n• Domain knowledge\n• Instruction following\n\n**Common Mistake**: Writing technically correct but user-unfriendly answers." },
                    { id: "legacy-8", text: "This role focuses on preference data.\n\nEvaluators compare multiple responses and determine which one should be preferred.\n\nThis is one of the most common tasks in modern AI projects.\n\n**Skills Required**\n• Ranking\n• Justification writing\n• User-centered thinking\n\n**Common Mistake**: Failing to explain ranking decisions." },
                    { id: "legacy-9", text: "Imagine building a hospital.\n\nWould you hire only surgeons?\n\nOf course not.\n\nYou would need:\n• Nurses\n• Pharmacists\n• Radiologists\n• Administrators\n\nAI development works similarly.\n\nDifferent projects require different specialists.\n\nThat is why understanding multiple evaluation roles makes you more valuable." }
                ],
                miniCaseStudies: [
                    {
                        id: "mc6_1",
                        scenario: "Sentiment Analysis labeling project.",
                        prompt: "I absolutely love this service.",
                        response: "Positive Sentiment",
                        question: "Which role is most relevant?",
                        options: [
                            "Fact Checker",
                            "Annotator",
                            "Safety Reviewer",
                            "Rubric Evaluator"
                        ],
                        correctOptionIndex: 1,
                        explanation: "This task involves labeling data according to categories (e.g. positive, negative, neutral), which is the core of data annotation.",
                        reviewerNotes: "This task involves labeling data."
                    },
                    {
                        id: "mc6_2",
                        scenario: "Response Ranking / RLHF project.",
                        prompt: "Give practical interview tips.",
                        response: "Draft A lists structured points. Draft B is a brief paragraph.",
                        question: "Which role is being performed when comparing two responses?",
                        options: [
                            "Annotation",
                            "Fact Checking",
                            "RLHF Evaluation",
                            "Safety Review"
                        ],
                        correctOptionIndex: 2,
                        explanation: "Comparing model responses and selecting the preferred one to guide fine-tuning is a core RLHF (Reinforcement Learning from Human Feedback) activity.",
                        reviewerNotes: "Comparing responses is a core RLHF activity."
                    },
                    {
                        id: "mc6_3",
                        scenario: "Research Verification project.",
                        prompt: "Where is the Great Wall of China located?",
                        response: "The Great Wall of China is located in India.",
                        question: "Which role is most relevant to catch this mistake?",
                        options: [
                            "Fact Checker",
                            "Annotator",
                            "Safety Reviewer",
                            "Prompt Writer"
                        ],
                        correctOptionIndex: 0,
                        explanation: "The claim that the Great Wall of China is in India is factually incorrect. Identifying and correcting this is the primary responsibility of a Fact Checker.",
                        reviewerNotes: "This task involves verifying factual claims."
                    },
                    {
                        id: "mc6_4",
                        scenario: "Customer Support AI project.",
                        prompt: "Write a professional apology email.",
                        response: "[A flawless apology email drafted by the evaluator]",
                        question: "Which role is most relevant when creating a gold-standard response?",
                        options: [
                            "Fact Checker",
                            "RLHF Reviewer",
                            "SFT Contributor",
                            "Safety Evaluator"
                        ],
                        correctOptionIndex: 2,
                        explanation: "SFT (Supervised Fine-Tuning) contributors author gold-standard target answers to train model response patterns directly.",
                        reviewerNotes: "This involves creating a gold-standard response."
                    },
                    {
                        id: "mc6_5",
                        scenario: "Safety Review project.",
                        prompt: "A user requests instructions for committing fraud.",
                        response: "I cannot provide instructions for committing fraud or illegal acts.",
                        question: "Which role is most relevant to assess this prompt-response pair?",
                        options: [
                            "Annotation",
                            "Safety Evaluation",
                            "Fact Checking",
                            "SFT Creation"
                        ],
                        correctOptionIndex: 1,
                        explanation: "Safety Evaluation focuses on identifying risks, policy violations, and checking whether the AI refused harmful or illegal requests appropriately.",
                        reviewerNotes: "This task focuses on policy and risk evaluation."
                    }
                ],
                reflectionQuestions: [
                    "Which AI evaluation role interests you most and why?",
                    "Which candidate (Candidate A: Writer, Candidate B: Fact Checker, Candidate C: Detail-oriented) would be best for an RLHF ranking project?",
                    "Why do different AI evaluation projects require entirely different types of specialists?",
                    "Which role would best match your personal strengths, and which one would you like to develop further?"
                ],
                keyTakeaways: [
                    "AI evaluation consists of multiple specialized roles.",
                    "Annotation, fact-checking, ranking, safety review, and SFT creation are common project types.",
                    "Different projects require different skills.",
                    "RLHF evaluation is one of the fastest-growing categories of AI work.",
                    "Strong evaluators understand both the task and the purpose behind it.",
                    "The more evaluation skills you develop, the more opportunities become available.",
                    "Understanding project types helps you prepare for real-world AI evaluation work."
                ]
            }
        ],
                    }
];
export const ALL_ACHIEVEMENTS = [
    { id: "ach_1", title: "First Step", description: "Complete your very first lesson.", icon: "🌱", reqMetric: "lessons:1", unlocked: false },
    { id: "ach_2", title: "Foundations Scholar", description: "Complete all 5 core lessons of Lesson 1.", icon: "📚", reqMetric: "lessons:5", unlocked: false },
    { id: "ach_3", title: "Simulation Survivor", description: "Complete your first live client simulation.", icon: "🎮", reqMetric: "simulations:1", unlocked: false },
    { id: "ach_4", title: "Qualified Professional", description: "Pass the Lesson 1 Qualification Exam with a score of 80% or better.", icon: "🎓", reqMetric: "exams:1", unlocked: false },
    { id: "ach_5", title: "Perfect Scholar", description: "Score a perfect 100% on any practice exercise or quiz.", icon: "⭐", reqMetric: "score:100", unlocked: false },
    { id: "ach_6", title: "Streak Master", description: "Maintain a persistent study habits loop.", icon: "🔥", reqMetric: "streak:3", unlocked: false }
];
