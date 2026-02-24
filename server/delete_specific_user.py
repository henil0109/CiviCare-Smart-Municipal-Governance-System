
from pymongo import MongoClient
import os

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')

def delete_user():
    try:
        client = MongoClient(MONGO_URI)
        db = client.civicare_db
        users_collection = db.users
        
        email_to_delete = "vishwampatel9191@gmail.com"
        
        # Check if user exists
        user = users_collection.find_one({"email": email_to_delete})
        
        if user:
            print(f"User found: {user.get('username')} ({user.get('email')})")
            print(f"Role: {user.get('role')}")
            
            # Delete
            result = users_collection.delete_one({"email": email_to_delete})
            
            if result.deleted_count == 1:
                print(f"SUCCESS: User '{email_to_delete}' has been deleted from the database.")
            else:
                print(f"ERROR: Failed to delete user '{email_to_delete}'.")
        else:
            print(f"User '{email_to_delete}' not found in the database.")
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    delete_user()
