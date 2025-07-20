"""Add status and notes columns to clients and appointments

Revision ID: 001
Revises: 
Create Date: 2024-07-16 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add status and notes columns to clients table
    op.add_column('clients', sa.Column('status', sa.String(20), nullable=True, default='active'))
    op.add_column('clients', sa.Column('notes', sa.Text(), nullable=True))
    
    # Add missing columns to appointments table
    op.add_column('appointments', sa.Column('notes', sa.Text(), nullable=True))
    op.add_column('appointments', sa.Column('is_recurring', sa.Boolean(), nullable=True, default=False))
    op.add_column('appointments', sa.Column('recurring_pattern', sa.JSON(), nullable=True))
    op.add_column('appointments', sa.Column('reminder_sent', sa.Boolean(), nullable=True, default=False))
    op.add_column('appointments', sa.Column('reminder_time', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Remove columns from appointments table
    op.drop_column('appointments', 'reminder_time')
    op.drop_column('appointments', 'reminder_sent')
    op.drop_column('appointments', 'recurring_pattern')
    op.drop_column('appointments', 'is_recurring')
    op.drop_column('appointments', 'notes')
    
    # Remove columns from clients table
    op.drop_column('clients', 'notes')
    op.drop_column('clients', 'status') 