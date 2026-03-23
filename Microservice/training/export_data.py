import pyodbc
import pandas as pd
import os

CONN_STR = (
    "Driver={SQL Server};"
    "Server=VICTUS\\SQLEXPRESS;"
    "Database=PratishaDB;"
    "Trusted_Connection=yes;"
)

def export_workshops():
    print("🔌 Connecting to database to export workshop data...")
    try:
        conn = pyodbc.connect(CONN_STR)
        query = """
            SELECT 
                w.Id, 
                w.Title + ' ' + ISNULL(w.Tagline, '') + ' ' + w.Description AS text
            FROM Workshops w
            WHERE w.Status = 1 AND w.IsActive = 1
        """
        
        df = pd.read_sql(query, conn)
        
        os.makedirs("data", exist_ok=True)
        
        # Save to CSV
        output_path = "data/workshops_data.csv"
        df.to_csv(output_path, index=False)
        
        print(f"Success! Exported {len(df)} workshops to {output_path}")
        conn.close()
        return True
    except Exception as e:
        print(f"Database Export Failed: {e}")
        return False

if __name__ == "__main__":
    export_workshops()
