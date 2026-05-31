const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const resourceService = require('./resource.service');

exports.getResources = asyncHandler(async (req, res) => {
  const resources = await resourceService.getAllResources(req.query);
  res.status(200).json(new ApiResponse(200, resources));
});

exports.getResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.getResourceById(req.params.id);
  res.status(200).json(new ApiResponse(200, resource));
});

exports.createResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.createResource(req.body);
  res.status(201).json(new ApiResponse(201, resource, 'Resource created'));
});

exports.updateResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.updateResource(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, resource, 'Resource updated'));
});

exports.deleteResource = asyncHandler(async (req, res) => {
  await resourceService.deleteResource(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Resource deleted'));
});
