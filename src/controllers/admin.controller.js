import asyncHanlder from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { pool } from "../config/db.js";
import bcrypt, { genSalt } from "bcrypt";






export const adminRegisteration = asyncHanlder(async(req ,res)=>{
    
    const {username , password } = req.body;

    if(!username || !password){
        throw new ApiError(400 ,"Username and password are required")
    }

    if(password.length<8){
        throw new ApiError(422 ,"Password should be at least 8 character long" )
    }

    const salt =await bcrypt.genSalt(10);
    const hashpassword =await bcrypt.hash(password, salt)
    const role = "admin";

    const Query = "INSERT INTO admin (admin_username, password) VALUES ($1, $2 )"

    const {rows} = await  pool.query(Query , [username , hashpassword ]);

    const admin = rows[0];

    res.status(201).json(
        new ApiResponse(201 , admin , "Admin is registered ")
    )
})

export const loginadmin = asyncHanlder(async(req, res)=>{

    const {username , password} = req.body
    
    if(!username || !password){
        throw new ApiError( 401 ,"Username and password are required")
    }

    const Query = "SELECT admin_username , password   FROM admin WHERE admin_username = ($1)"

    const {rows} = await pool.query(Query, [username]);
    const user = rows[0]

    res.status(200).json(
        new ApiResponse(200 , user , "admin logged in successfully ")
    )

    
})

export const  studentwithcoursedetails = asyncHanlder(async(req ,res)=>{
  
    const query = `
      SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        s.email,
        c.course_name,
        c.course_code,
        c.course_duration
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.course_id
      ORDER BY s.student_id ASC;
    `;

    const result = await pool.query(query);

    // Return structured JSON
    res.status(200).json({
      count: result.rows.length,
      data: result.rows
    });

})

export const getStudentsByCourse = asyncHanlder(async (req, res) => {
  const { id } = req.params; // "CS101" or "DS200"

  const query = `
    SELECT 
      s.student_id,
      s.first_name,
      s.last_name,
      s.email,
      c.course_id,
      c.course_name,
      c.course_code,
      c.course_duration
    FROM students s
    JOIN courses c ON s.course_id = c.course_id
    WHERE c.course_code = $1

  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No students found for this course.",
      data: []
    });
  }

  res.status(200).json({
    success: true,
    data: result.rows,
    message: `Students registered for course ${id}`
  });
});


export const updateStudentDeatils = asyncHanlder(async(req ,res)=>{

   

    const { id } = req.params; 
    console.log(id)

 const allowedFields = ["first_name", "last_name", "email", "course_id"];

  const updates = [];
  const values = [];
  let index = 1;

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = $${index++}`);
      values.push(req.body[field]);
    }
  }

  if (updates.length === 0) {
    throw new ApiError(400, "No valid fields provided to update");
  }

  const query = `
    UPDATE students
    SET ${updates.join(", ")}
    WHERE student_id = $${id}
    RETURNING  first_name, last_name, email, course_id
  `;

  values.push(id);

  const { rows } = await pool.query(query, values);

  const data = rows[0];

  res.status(200).json(
    new ApiResponse(200 , data , `The student with ${id } is updated`)
  )

})




export const deleteStudent = asyncHanlder(async (req, res) => {
    
    const { id } = req.params;
    const { type } = req.query; // strict vs standard

   

    try {
        await pool.query('BEGIN');

        // 2. Find the student and LOCK the row
        // 'FOR UPDATE' prevents other transactions from changing this student 
        // while we are deciding whether to delete them.
        const checkQuery = `
            SELECT student_id, first_name, course_id 
            FROM students 
            WHERE student_id = $1 
            FOR UPDATE
        `;
        
        const checkResult = await client.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
            throw new ApiError(404, "Student not found");
        }

        const student = checkResult.rows[0];

        // 3. OPTION: Restrict Deletion
        // If type is 'restrict' AND the student is enrolled (course_id is not null)
        if (type === 'restrict' && student.course_id !== null) {
            throw new ApiError(
                400, 
                "Cannot delete: Student is currently enrolled in a course. Unenroll them first."
            );
        }

        // 4. Perform Deletion
        // (If we reached here, either type != restrict OR student has no course)
        const deleteQuery = "DELETE FROM students WHERE student_id = $1";
        await client.query(deleteQuery, [id]);

        // 5. Commit Transaction
        await client.query('COMMIT');

        return res.status(200).json(
            new ApiResponse(200, {}, `Student deleted successfully`)
        );

    } catch (err) {
        // 6. Rollback if error occurs
        await client.query('ROLLBACK');
        throw err;
    } finally {
        // 7. Release client back to pool
        client.release();
    }
});




