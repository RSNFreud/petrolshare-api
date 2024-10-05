import "@fastify/static";

declare module "fastify" {
  interface FastifyReply {
    sendFile(filename: string, rootPath?: string): FastifyReply;
    sendFile(filename: string, options?: fastifyStatic.SendOptions): FastifyReply;
    sendFile(filename: string, rootPath?: string, options?: fastifyStatic.SendOptions): FastifyReply;
    download(filepath: string, options?: fastifyStatic.SendOptions): FastifyReply;
    download(filepath: string, filename?: string): FastifyReply;
    download(filepath: string, filename?: string, options?: fastifyStatic.SendOptions): FastifyReply;
    view<T extends { [key: string]: any }>(page: string, data: T, opts?: RouteSpecificOptions): FastifyReply;
    view(page: string, data?: object, opts?: RouteSpecificOptions): FastifyReply;
  }
}
