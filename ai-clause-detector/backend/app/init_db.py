
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from models import Base
from database import engine

# Create tables
Base.metadata.create_all(bind=engine)
