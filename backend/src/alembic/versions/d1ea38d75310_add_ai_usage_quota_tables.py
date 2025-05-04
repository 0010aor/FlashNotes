"""Add AI Usage Quota tables

Revision ID: d1ea38d75310
Revises: cb16ae472c1e
Create Date: 2025-05-04 09:59:20.325131

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'd1ea38d75310'
down_revision = 'cb16ae472c1e'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'aiusagequota',
        sa.Column('id', sa.UUID(), primary_key=True, nullable=False),
        sa.Column('user_id', sa.UUID(), sa.ForeignKey('user.id', ondelete='CASCADE'), index=True, nullable=False),
        sa.Column('usage_count', sa.Integer, default=0, nullable=False),
        sa.Column('last_reset_time', sa.DateTime(timezone=True), nullable=False),
    )


def downgrade():
    op.drop_table('aiusagequota')
