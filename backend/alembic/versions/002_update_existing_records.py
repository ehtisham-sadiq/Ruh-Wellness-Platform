"""Update existing records to set default values for boolean fields

Revision ID: 002
Revises: 001
Create Date: 2024-07-16 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Update existing appointments to set default values for boolean fields
    op.execute("UPDATE appointments SET is_recurring = false WHERE is_recurring IS NULL")
    op.execute("UPDATE appointments SET reminder_sent = false WHERE reminder_sent IS NULL")
    
    # Update existing clients to set default status
    op.execute("UPDATE clients SET status = 'active' WHERE status IS NULL")


def downgrade() -> None:
    # This migration only sets default values, so downgrade does nothing
    pass 