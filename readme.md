![alt text](https://github.com/vikizax/Pizza-API-Nodejs/blob/master/screenshot/pizzaapi.jpg)



# Description:

	API for a pizza-delivery company.

	(In order to use demo gui, provide the mailgun and stripe test auth key in the lib/config.js)
	
## List of API path : 
 - api/users
 - api/tokens
 - api/login
 - api/menuitems
 - api/usercart
 - api/createorder
 - api/user/cart
 	 
## api/users
 
	 [POST] api/users :
	
		 Creates a new user with the provided details.
		 
		 @ Required Payload data: 
		 ```
		 {
			"firstName": "str_value_required",
			"lastName": "str_value_required",
			"phone": "str_value_10_digit_number_required",
			"password": "str_value_length_more_than_(5)_required",
			"tosAgreement": boolean_value_required,
			"email": "str_value_vaild_email_format_required",
			"address": "str_value_required",
		 }
		 ```
		 @ Required Query Params: None	

	[GET] api/users :
	
		Gets the details of the provided user id.
		
		@ Required Payload data: None
	
		@ Required Query Params: 
	
			> email=email_of_the_user_required
		
		@ Required Key in Headers: 
			> token:token_id_created_for_the_user_length_20_required
	
	[PUT] api/users :
		
		Updates user details with the provided filed.
		At least one of the optional fields must be provided to initiate the update.
		User Id (email) is required.
		@ Required Payload data: 
		```
		{
			"firstName": "str_value_optional",
			"lastName": "str_value_optional",
			"phone": "str_value_10_digit_number_optional",
			"password": "str_value_length_more_than_(5)_optional",
			"address": "str_value_optional",
			"email" "str_value_vaild_email_format_required"
		 }
		```
		@ Required Query Parasm: None
		
		@ Required Key in Headers: 
			> token:token_id_created_for_the_user_length_20_required
	
	[DELETE] api/users :
	
		Deletes the user.
		
		@ Required Payload data: None
		
		@ Required Query Params:
			> email=user_email_of_the_user
			
		@ Required Key in Headers: 
			> token:token_id_created_for_the_user_length_20_required
				
## api/login
	
	[POST] api/login :
		
		Use to login regestered user.
		
		@ Required Payload data:
		```
		{
			"email" "str_value_vaild_email_format_required",
			"password": "str_value_length_more_than_(5)_required"
		}
		```
		
		@ Required Query Params: None
		
		@ Required/Optional Key in Headers:
			> token:token_id_created_for_the_user_length_20
			
		*If the token is provided in the headers: the login process will extend the expiration of the token.
		*If the token is not provided in the headers: the login process will create a new token for the user.
	

## api/tokens
	
	[POST] api/tokens :
		
		Creates a token for the user.
		
		@ Required Payload data:
		```
		{
			"email" "str_value_vaild_email_format_required",
			"password": "str_value_length_more_than_(5)_required"
		 }
		 ```
		
		@ Required Query Params: None
	
	[GET] api/tokens :
		
		Gets the token details.
		
		@ Required Payload data: None

		@ Required Query Params:
			> id=token_id_created_for_the_user

	[PUT] api/tokens :
		
		Extends the token expiration if it exist and not already expired.
		
		@ Required Payload data:
		```
		{
			"id": "str_value_token_id_length_20_required",
			"extend" : boolean_value_required
		}
		```
		
		@ Required Query Params: None

	[DELETE] api/tokens :
	
		Deletes the token if exist.
	
		@ Required Payload data: None
		
		@ Required Query Params:
			> id=token_id_length_20_required


## api/menuitems

	[GET] api/menuitems :
		
	Gets all the menu items available. (.data/shoppingItems/items.json) 
	
	@ Required Payload data:
	``` 
	{
		"email" "str_value_vaild_email_format_required"
	}
	```

	@ Required Query Params: None
	
	@ Required Key in Headers: 
		> token:token_id_created_for_the_user_length_20_required

## api/usercart

	[POST] api/usercart :
		
	Adds a item selected by the user in user cart.

	@ Required Payload data: 
	Items selected must be listed in the menu items.
	```
	{
		"email": "str_value_vaild_email_format_required",
		"item": "item_name"
	}
	```	
	
	@ Required Query Params: None

	@ Required Key in Headers:
		> token:token_id_created_for_the_user_length_20_required
	
	[GET] api/usercart :
	
	Returns list of items available in user cart.

	@ Required Payload data: None
	
	@ Required Query Params: 
		> email=email_of_the_user_required

	@ Required Key in Headers:
		> token:token_id_created_for_the_user_length_20_required
	

## api/createorder

	[POST] api/createorder :
	
	Initiates Stripe api for payment.
	For the successful payment it creates order for the selected item in the user cart.
	Item ordered will be removed from the user cart.
	Users will be alerted via email using Mailgun API.
	
	@ Required Payload data:
	```
	{
		"email": "str_value_vaild_email_format_required", 
		"phone": "str_value_10_digit_number_required",
		"address": "str_value_required",
		"cartItemId": "str_value_length_5_required"
	}
	```
	
	@ Required Query Params: None

	@ Required Key in Headers:
		> token:token_id_created_for_the_user_length_20_required

## api/user/cart:
	[GET] api/user/cart:

	Return the dynamically created template string for the user cart items.
	It is used to display the user cart menu items dynamically.
	
	@ Required Query Params: 
		> email=email_of_the_user_required

	@ Required Key in Headers:
		> token:token_id_created_for_the_user_length_20_required

## Response:

|Status Code|Description| 
|--|--|--|
|200|  Success|
|400|Missing required fields|
|403| Missing or invalid feild|
|404| Not found|
|405|Bad request|
|500| Server Error

## Payload Example:
	
	```
	{
    "firstName": "John",
    "lastName": "Lewis",
    "phone": "1234567890",
    "password": "passwordIsSecret1234",
    "tosAgreement": true,
    "email": "add_valid_email@provider.com",
    "address": "California",
    "item": "chicken_golden_delight_pizza",
    "cartItemId": "1e3id"
	}
	```

		
		
				
		
	 
	
	 

		  
		 




 



