const { StatusCodes } = require('http-status-codes');

const { UserService } = require('../services');

const { ErrorResponse, SuccessResponse } = require('../utils/common');

/**
 * POST: /signup
 * req-body {email: 'a@b.com', password: '1234}
 */

async function signUp(req, res) {
  try {
   const user = await UserService.create({
      email: req.body.email,
      password: req.body.password
   });
   SuccessResponse.data = user;
   return res
     .status(StatusCodes.CREATED)
     .json(SuccessResponse);
  } catch (error) {
      ErrorResponse.error = error;
      return res
              .status(error.statusCode)
              .json(ErrorResponse)

  }
}

/**
 * POST: /signin
 * req-body {email: 'a@b.com', password: '1234}
 */

async function signIn(req, res) {
  try {
   const user = await UserService.signin({
      email: req.body.email,
      password: req.body.password
   });
   SuccessResponse.data = user;
   return res
     .status(StatusCodes.CREATED)
     .json(SuccessResponse);
  } catch (error) {
      ErrorResponse.error = error;
      return res
              .status(error.statusCode)
              .json(ErrorResponse)

  }
}

/**
 * POST: /role
 * req-body {role: 'admin', id: 2}
 */

async function addRoleToUser(req, res) {
  try {
    console.log("REACHED CONTROLLER")
   const user = await UserService.addRoleToUser({
      role: req.body.role,
      id: req.body.id
   });
   SuccessResponse.data = user;
   return res
     .status(StatusCodes.CREATED)
     .json(SuccessResponse);
  } catch (error) {
      ErrorResponse.error = error;
      return res
              .status(error.statusCode)
              .json(ErrorResponse)

  }
}

module.exports = {
  signUp,
  signIn,
  addRoleToUser
}