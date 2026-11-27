"""hcp assigned rep

Revision ID: 0002
Revises: 0001
Create Date: 2026-11-27 18:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '0002'
down_revision: Union[str, Sequence[str], None] = '0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('hcps', sa.Column('assigned_user_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_hcps_assigned_user_id'), 'hcps', ['assigned_user_id'], unique=False)
    op.create_foreign_key(
        'fk_hcps_assigned_user_id_users', 'hcps', 'users', ['assigned_user_id'], ['id'], ondelete='SET NULL'
    )


def downgrade() -> None:
    op.drop_constraint('fk_hcps_assigned_user_id_users', 'hcps', type_='foreignkey')
    op.drop_index(op.f('ix_hcps_assigned_user_id'), table_name='hcps')
    op.drop_column('hcps', 'assigned_user_id')
