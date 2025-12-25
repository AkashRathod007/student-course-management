class ApiResponse {
    constructor(
        statusCode =200,
        data,
        message

    ){
       this.message = message;
       this.statusCode= statusCode,
       this.success = statusCode<400
       this.data = data 
    }
}

export default ApiResponse