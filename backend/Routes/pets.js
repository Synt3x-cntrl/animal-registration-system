const express = require("express");
const { createPet, getUserPets, getAllPets, deletePet } = require("../controllers/pets");

const router = express.Router();

router.post("/", createPet);
router.get("/user/:userId", getUserPets);
router.get("/", getAllPets);
router.delete("/:id", deletePet);

module.exports = router;
