from langchain_groq import ChatGroq
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from typing import List
import wikipedia
from app.config import settings


class LLMService:
    """Handle LLM operations using Groq"""
    
    def __init__(self):
        self.llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name=settings.GROQ_MODEL,
            temperature=0.7
        )
    
    def generate_answer(self, query: str, context: str) -> str:
        """Generate answer based on context"""
        prompt_template = """You are a helpful AI assistant for students. Use the provided context to answer the question comprehensively.

If the context contains information from multiple sources (documents and Wikipedia), combine them naturally into your answer.

Context:
{context}

Question: {question}

Answer (provide a comprehensive response using all available information):"""
        
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        response = chain.run(context=context, question=query)
        
        return response
    
    def get_wikipedia_answer(self, query: str) -> str:
        """Get answer from Wikipedia"""
        try:
            # Search Wikipedia
            results = wikipedia.search(query, results=1)
            
            if not results:
                return "I couldn't find information about that on Wikipedia."
            
            # Get summary
            summary = wikipedia.summary(results[0], sentences=3)
            return summary
        
        except wikipedia.exceptions.DisambiguationError as e:
            # If disambiguation, take the first option
            try:
                summary = wikipedia.summary(e.options[0], sentences=3)
                return summary
            except:
                return "I found multiple topics. Please be more specific."
        
        except wikipedia.exceptions.PageError:
            return "I couldn't find that page on Wikipedia."
        
        except Exception as e:
            return f"Error searching Wikipedia: {str(e)}"
    
    def generate_summary(self, text: str) -> str:
        """Generate summary of document text"""
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
