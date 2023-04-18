
# TravelBack

This is the backend for our application [TravelSpot](https://github.com/waldoapp/TravelDemo).

It is intended to demonstrate the different capabilities of Waldo when used with this application.

See the below list of endpoints and their purposes.

It is deployed on Heroku and can be accessed at https://travel-back.herokuapp.com/

### GET /validateEmail?email=$email

This endpoint is intended to be buggy, and highlights how you can easily debug it directly from
within Waldo.

It is intended to validate a given email address while registering on TravelSpot, and should return
either a 200, or a 400 with the reason why the email is rejected.

However, due to some lazy coding, some input will generate a 500.

Below is a sample of queries with their responses.

```
GET https://travel-back.herokuapp.com/validateEmail?email=laurent@waldo.com
200 OK
{
  "success": true
}
```

```
GET https://travel-back.herokuapp.com/validateEmail?email=laurent@icloud.com
400 Bad Request
{
  "success": false,
  "reason": "Domain icloud is not supported"
}
```

```
GET https://travel-back.herokuapp.com/validateEmail?email=laurent
500 Internal Server Error
Cannot read properties of null (reading '2')
```
