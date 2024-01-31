const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
const { UserRepository, RoleRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { Auth, Enums } = require('../utils/common');
const userRepository = new UserRepository();
const roleRepository = new RoleRepository();

async function create(data) {
  try {
    const user = await userRepository.create(data);
    const role = await roleRepository.getRoleByName(Enums.USER_ROLES_ENUMS.CUSTOMER);
    user.addRole(role);  // here addRole is the  magical method that sequelize provides
    return user;
} catch (error){
if(error.name == 'SequelizeValidationError' || error.name == 'SequelizeUniqueConstraintError') {
  let explanation = [];
  error.errors.forEach((err) => {
      explanation.push(err.message)
  })
  throw new AppError(explanation, StatusCodes.BAD_REQUEST);
}
throw new AppError('Cannot create a new user object', StatusCodes.INTERNAL_SERVER_ERROR);
}
}

async function signin(data) {
  try {
    const user = await userRepository.getUserByEmail(data.email);
    if(!user) {
      throw new AppError('No user found for the given email', StatusCodes.NOT_FOUND);
    }
    const passwordMatch = Auth.checkPassword(data.password, user.password);
    if(!passwordMatch) {
      throw new AppError('Invalid Password', StatusCodes.BAD_REQUEST);
    }

    const jwt = Auth.createToken({id: user.id, email: user.email});
    return jwt;
  } catch (error) {
    if(error instanceof AppError) throw error;
    throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function isAuthenticated(token) {
  try {
    if(!token) {
      throw new AppError('Missing JWT token', StatusCodes.BAD_REQUEST);
    }

    const response = Auth.verifyToken(token);
    const user = await userRepository.get(response.id);
    if(!user) {
      throw new AppError('No user found', StatusCodes.BAD_REQUEST);
    }
    return user.id;
 
  } catch(error) {
    console.log(error, "ERROR AT SERVICE");
    if(error instanceof AppError) throw error;

    if(error.name === "JsonWebTokenError") {
      throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
    }

    if(error.name === "TokenExpiredError") {
      throw new AppError('JWT Token Expired', StatusCodes.BAD_REQUEST);
    }
    throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function addRoleToUser(data) {
  try {
    const user = await userRepository.get(data.id);
    if(!user) {
      throw new AppError('No user found', StatusCodes.NOT_FOUND);
    }
    const role = await roleRepository.getRoleByName(data.role);
    if(!role) {
      throw new AppError('No role found', StatusCodes.NOT_FOUND);
    }
    user.addRole(role);
    return user;

  } catch(error) {
    console.log(error);
    if(error instanceof AppError) throw error;
    throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function isAdmin(id) {
  try {
    const user = await userRepository.get(id);
    if(!user) {
      throw new AppError('No user found', StatusCodes.NOT_FOUND);
    }
    const adminRole = await roleRepository.getRoleByName(Enums.USER_ROLES_ENUMS.ADMIN);
    if(!adminRole) {
      throw new AppError('No admin role found', StatusCodes.NOT_FOUND);
    }
    return user.hasRole(adminRole);
  } catch(error) {
    console.log(error);
    if(error instanceof AppError) throw error;
    throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
  }

}

module.exports = {
  create,
  signin,
  isAuthenticated,
  addRoleToUser,
  isAdmin
}