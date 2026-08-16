"""create calculations table

Revision ID: f9a075780f9a
Revises:
Create Date: 2026-08-16 13:51:17.048395

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "f9a075780f9a"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "calculation",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("sex", sa.String(length=10), nullable=False),
        sa.Column("height_cm", sa.Float(), nullable=False),
        sa.Column("weight_kg", sa.Float(), nullable=False),
        sa.Column("activity_level", sa.String(length=20), nullable=False),
        sa.Column("goal", sa.String(length=10), nullable=False),
        sa.Column("bmi", sa.Float(), nullable=False),
        sa.Column("bmi_category", sa.String(length=20), nullable=False),
        sa.Column("bmr", sa.Integer(), nullable=False),
        sa.Column("maintenance_calories", sa.Integer(), nullable=False),
        sa.Column("target_calories", sa.Integer(), nullable=False),
        sa.Column("protein_grams", sa.Integer(), nullable=False),
        sa.Column("fat_grams", sa.Integer(), nullable=False),
        sa.Column("carb_grams", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("calculation")
