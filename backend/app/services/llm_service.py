from langchain_groq import ChatGroq
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from typing import List
from app.config import settings

class LLMService:
    """Handle LLM operations using Groq"""
    
    def __init__(self):
        self.llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name=settings.GROQ_MODEL,
            temperature=0.7
        )
    
    def generate_answer(self, query: str, context: List[str]) -> str:
        """Generate answer based on context"""
        context_text = "\n\n".join([doc.page_content for doc in context])
        
        prompt_template = """You are a helpful AI assistant for students. Use the following context to answer the question. 
If you cannot find the answer in the context, say so clearly.

Context:
{context}

Question: {question}

Answer:"""
        
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        response = chain.run(context=context_text, question=query)
        
        return response
    
    def summarize_document(self, text: str) -> str:
        """Summarize document text"""
        prompt_template = """Summarize the following lecture notes or document in 3-4 clear paragraphs. 
Focus on key concepts and important information.

Text:
{text}

Summary:"""
        
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["text"]
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        summary = chain.run(text=text[:4000])  # Limit text length
        
        return summary
    
    def generate_quiz(self, text: str, num_questions: int = 5) -> str:
        """Generate quiz questions from text"""
        prompt_template = """Generate {num_questions} multiple-choice questions based on the following content. 
For each question, provide 4 options (A, B, C, D) and indicate the correct answer.

Format:
Question 1: [question text]
A) [option]
B) [option]
C) [option]
D) [option]
Correct Answer: [letter]

Content:
{text}

Quiz:"""
        
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["text", "num_questions"]
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        quiz = chain.run(text=text[:3000], num_questions=num_questions)
        
        return quiz

llm_service = LLMService()
