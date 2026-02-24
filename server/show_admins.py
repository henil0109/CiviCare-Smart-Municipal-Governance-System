from pymongo import MongoClient
db = MongoClient('mongodb://localhost:27017/civicare_db').civicare_db
users = list(db.users.find({}, {'username':1,'email':1,'role':1,'_id':0}))
print('Remaining accounts:')
for u in users:
    print(f"  [{u['role'].upper()}]  {u['username']}  <{u['email']}>")
print(f'\nTotal: {len(users)} account(s) remain.')
