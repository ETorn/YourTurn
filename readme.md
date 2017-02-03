YourTurnServer
==============

## Rutes

### Users
+ GET /users -> Llista usuaris
+ POST /users -> Crea un usuari
+ GET /users/:user_id -> Retorna l'usuari corresponent a la id
+ PUT /users/:user_id -> Modifica l'usuari
+ DELETE /users/:user_id -> Elimina l'usuari

### Stores
+ GET /stores -> LLista parades
+ POST /stores -> Crea una parada
+ GET /stores/:store_id -> Retorna la parada corresponent a la id
+ PUT /stores/:store_id -> Modifica la parada
+ DELETE /stores/:store_id -> Elimina la parada
+ POST /stores/:store_id/addUser/:user_id -> Afegeix un usuari a la cua de la parada
+ DELETE /stores/:store_id/addUser/:user_id -> Elimina un usuari de la cua.

### Supers
+ GET /supers -> Llista supers
+ POST /supers -> Crea un super
+ GET /supers/:super_id -> Retorna l'super corresponent a la id
+ PUT /supers/:super_id -> Modifica l'super
+ DELETE /supers/:super_id -> Elimina l'super
