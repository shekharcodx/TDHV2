module.exports = async function softDelete(Model, id) {
  return await Model.findOneAndUpdate(
    { _id: id },
    { isActive: false },
    { new: true }
  );
};
