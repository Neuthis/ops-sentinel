from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class IncidentLog(Base):
    __tablename__ = "incident_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    service_affected = Column(String, nullable=False)
    resolution = Column(Text, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
