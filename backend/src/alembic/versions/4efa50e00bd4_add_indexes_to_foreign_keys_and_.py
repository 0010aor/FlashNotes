"""Add indexes to foreign keys and timestamps

Revision ID: 4efa50e00bd4
Revises: cb7e65c8085b
Create Date: 2025-04-21 18:54:30.855702

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '4efa50e00bd4'
down_revision = 'cb7e65c8085b'
branch_labels = None
depends_on = None


def upgrade():
    # Use "CREATE INDEX IF NOT EXISTS" instead of "CREATE INDEX"
    op.execute("CREATE INDEX IF NOT EXISTS ix_card_collection_id ON card (collection_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_practicesession_collection_id ON practicesession (collection_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_practicesession_created_at ON practicesession (created_at)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_practicecard_session_id ON practicecard (session_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_practicecard_card_id ON practicecard (card_id)")


def downgrade():
    # Remove index from PracticeCard.card_id
    op.drop_index(op.f('ix_practicecard_card_id'), table_name='practicecard')

    # Remove index from PracticeCard.session_id
    op.drop_index(op.f('ix_practicecard_session_id'), table_name='practicecard')

    # Remove index from PracticeSession.created_at
    op.drop_index(op.f('ix_practicesession_created_at'), table_name='practicesession')

    # Remove index from PracticeSession.collection_id
    op.drop_index(op.f('ix_practicesession_collection_id'), table_name='practicesession')

    # Remove index from Card.collection_id
    op.drop_index(op.f('ix_card_collection_id'), table_name='card')
