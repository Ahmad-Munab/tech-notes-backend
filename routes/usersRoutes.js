const express = require("express")
const router = express.Router()
const path = require("path")

const usersController = require(path.join(__dirname, '../controllers/usersController'))


router.route('/')
    .get(usersController.getAllUsers)
    .post(usersController.createNewUser)
    .patch(usersController.updateUser)
    .put(usersController.updateUser)
    .delete(usersController.deleteUser)


module.exports = router