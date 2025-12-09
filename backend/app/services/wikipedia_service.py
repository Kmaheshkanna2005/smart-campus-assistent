import wikipedia
from typing import Optional

class WikipediaService:
    """Handle Wikipedia queries"""
    
    @staticmethod
    def search_wikipedia(query: str, sentences: int = 3) -> Optional[str]:
        """Search Wikipedia and return summary"""
        try:
            # Search Wikipedia
            results = wikipedia.search(query, results=1)
            
            if not results:
                return None
            
            # Get summary
            summary = wikipedia.summary(results[0], sentences=sentences)
            return summary
        
        except wikipedia.exceptions.DisambiguationError as e:
            # If disambiguation, take the first option
            try:
                summary = wikipedia.summary(e.options[0], sentences=sentences)
                return summary
            except:
                return None
        
        except wikipedia.exceptions.PageError:
            return None
        
        except Exception:
            return None

wikipedia_service = WikipediaService()
