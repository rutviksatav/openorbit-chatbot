import sqlite3
import os

def migrate():
    # Detect the correct relative/absolute location of chat.db
    db_paths = [
        "chat.db",
        "backend/chat.db",
        "../chat.db"
    ]
    
    db_path = None
    for path in db_paths:
        if os.path.exists(path):
            db_path = path
            break
            
    if not db_path:
        db_path = "backend/chat.db"
        
    print(f"Migrating database at: {db_path} (absolute: {os.path.abspath(db_path)})")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Inspect current messages table info
    cursor.execute("PRAGMA table_info(messages)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if "sources" not in columns:
        try:
            cursor.execute("ALTER TABLE messages ADD COLUMN sources TEXT;")
            print("Successfully added 'sources' column to 'messages' table.")
        except Exception as e:
            print(f"Error adding 'sources' column: {e}")
    else:
        print("'sources' column already exists in 'messages' table.")
        
    if "mode" not in columns:
        try:
            cursor.execute("ALTER TABLE messages ADD COLUMN mode TEXT;")
            print("Successfully added 'mode' column to 'messages' table.")
        except Exception as e:
            print(f"Error adding 'mode' column: {e}")
    else:
        print("'mode' column already exists in 'messages' table.")
        
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
