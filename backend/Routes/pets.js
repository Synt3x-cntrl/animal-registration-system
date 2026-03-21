const express = require("express");
const { createPet, getUserPets, getAllPets, deletePet, searchPets, updatePet } = require("../controllers/pets");

const router = express.Router();

router.post("/", createPet);
router.put("/:id", updatePet);
router.get("/search", searchPets);
router.get("/user/:userId", getUserPets);
router.get("/", getAllPets);
router.delete("/:id", deletePet);

module.exports = router;
