@Post()
create(
  @CurrentUser('userId') userId: string,
  @Param('projectId') projectId: string,
  @Body() body: any,
) {
  return this.designService.createDesign(userId, projectId, body);
}