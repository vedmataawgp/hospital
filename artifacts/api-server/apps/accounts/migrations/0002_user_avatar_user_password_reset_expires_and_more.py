# Idempotent migration: safe to re-run on PostgreSQL (column may already exist)
from django.db import migrations, models


def safe_add_user_fields(apps, schema_editor):
    """
    Add avatar / password_reset_token / password_reset_expires to the users table.
    Uses conditional logic so it succeeds even if the columns already exist
    (e.g. a previous run on PostgreSQL added them before migration state was saved).
    """
    vendor = schema_editor.connection.vendor
    conn = schema_editor.connection

    if vendor == 'postgresql':
        with conn.cursor() as cur:
            fields = [
                ('avatar', "ALTER TABLE users ADD COLUMN avatar VARCHAR(200) NULL"),
                ('password_reset_token', "ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(128) NULL"),
                ('password_reset_expires', "ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMPTZ NULL"),
            ]
            for col_name, ddl in fields:
                cur.execute(
                    "SELECT 1 FROM information_schema.columns "
                    "WHERE table_name='users' AND column_name=%s",
                    [col_name],
                )
                if not cur.fetchone():
                    cur.execute(ddl)

    elif vendor == 'sqlite':
        with conn.cursor() as cur:
            cur.execute("PRAGMA table_info(users)")
            existing = {row[1] for row in cur.fetchall()}
            if 'avatar' not in existing:
                cur.execute("ALTER TABLE users ADD COLUMN avatar VARCHAR(200) NULL")
            if 'password_reset_token' not in existing:
                cur.execute("ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(128) NULL")
            if 'password_reset_expires' not in existing:
                cur.execute("ALTER TABLE users ADD COLUMN password_reset_expires DATETIME NULL")

    else:
        raise RuntimeError(f"Unsupported database vendor: {vendor}")


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(safe_add_user_fields, migrations.RunPython.noop),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='user',
                    name='avatar',
                    field=models.ImageField(blank=True, null=True, upload_to='avatars/'),
                ),
                migrations.AddField(
                    model_name='user',
                    name='password_reset_expires',
                    field=models.DateTimeField(blank=True, null=True),
                ),
                migrations.AddField(
                    model_name='user',
                    name='password_reset_token',
                    field=models.CharField(blank=True, max_length=128, null=True),
                ),
            ],
        ),
    ]
