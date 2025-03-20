"""create_rag_tables

Revision ID: 003
Revises: 002
Create Date: 2023-07-10 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Создание таблицы коллекций документов
    op.create_table(
        'document_collections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_document_collections_id'), 'document_collections', ['id'], unique=False)
    op.create_index(op.f('ix_document_collections_name'), 'document_collections', ['name'], unique=False)
    
    # Создание таблицы документов
    op.create_table(
        'documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('file_type', sa.String(), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('content_hash', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('author', sa.String(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('is_processed', sa.Boolean(), nullable=False, default=False),
        sa.Column('processing_error', sa.Text(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_id'), 'documents', ['id'], unique=False)
    op.create_index(op.f('ix_documents_filename'), 'documents', ['filename'], unique=False)
    op.create_index(op.f('ix_documents_file_type'), 'documents', ['file_type'], unique=False)
    op.create_index(op.f('ix_documents_title'), 'documents', ['title'], unique=False)
    op.create_index(op.f('ix_documents_content_hash'), 'documents', ['content_hash'], unique=True)
    op.create_index(op.f('ix_documents_is_processed'), 'documents', ['is_processed'], unique=False)
    
    # Создание таблицы фрагментов документа
    op.create_table(
        'document_chunks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('document_id', sa.Integer(), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('start_char_idx', sa.Integer(), nullable=True),
        sa.Column('end_char_idx', sa.Integer(), nullable=True),
        sa.Column('page_number', sa.Integer(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('embedding', sa.Text(), nullable=True),  # JSON-строка векторного представления
        sa.Column('embedding_model', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_document_chunks_id'), 'document_chunks', ['id'], unique=False)
    op.create_index(op.f('ix_document_chunks_document_id'), 'document_chunks', ['document_id'], unique=False)
    op.create_index(op.f('ix_document_chunks_chunk_index'), 'document_chunks', ['chunk_index'], unique=False)
    
    # Создание таблицы связей между документами и коллекциями (многие-ко-многим)
    op.create_table(
        'document_collection',
        sa.Column('document_id', sa.Integer(), nullable=False),
        sa.Column('collection_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['collection_id'], ['document_collections.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('document_id', 'collection_id')
    )


def downgrade():
    # Удаление таблиц в обратном порядке
    op.drop_table('document_collection')
    op.drop_index(op.f('ix_document_chunks_chunk_index'), table_name='document_chunks')
    op.drop_index(op.f('ix_document_chunks_document_id'), table_name='document_chunks')
    op.drop_index(op.f('ix_document_chunks_id'), table_name='document_chunks')
    op.drop_table('document_chunks')
    op.drop_index(op.f('ix_documents_is_processed'), table_name='documents')
    op.drop_index(op.f('ix_documents_content_hash'), table_name='documents')
    op.drop_index(op.f('ix_documents_title'), table_name='documents')
    op.drop_index(op.f('ix_documents_file_type'), table_name='documents')
    op.drop_index(op.f('ix_documents_filename'), table_name='documents')
    op.drop_index(op.f('ix_documents_id'), table_name='documents')
    op.drop_table('documents')
    op.drop_index(op.f('ix_document_collections_name'), table_name='document_collections')
    op.drop_index(op.f('ix_document_collections_id'), table_name='document_collections')
    op.drop_table('document_collections') 