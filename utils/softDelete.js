module.exports = async function softDelete(Model, id) {
  const doc = await Model.findById(id);
  if (!doc) throw new Error("Document not found");
  console.log("doc-found", !!doc.isActive);
  doc.isActive = !doc.isActive;
  await doc.save();

  console.log("doc", doc);
  return doc;
  // return await Model.findOneAndUpdate(
  //   { _id: id },
  //   { $bit: { isActive: { xor: 1 } } },
  //   { new: true }
  // );
};
