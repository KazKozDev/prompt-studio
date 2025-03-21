"""create user settings table

Revision ID: create_user_settings_table
Revises: 
Create Date: 2024-03-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'create_user_settings_table'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'user_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('openai_key', sa.String(), nullable=True),
        sa.Column('anthropic_key', sa.String(), nullable=True),
        sa.Column('mistral_key', sa.String(), nullable=True),
        sa.Column('google_key', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_settings_id'), 'user_settings', ['id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_user_settings_id'), table_name='user_settings')
    op.drop_table('user_settings') 