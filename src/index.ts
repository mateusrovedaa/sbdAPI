import fastify from "fastify";
import { Static, Type } from "@sinclair/typebox";
import swagger from "fastify-swagger";
import { employees_gender, employees, PrismaClient } from "@prisma/client";
import { SocketAddress } from "net";
import { Request } from ".pnpm/light-my-request@4.9.0/node_modules/light-my-request";
import fastifyCors from "fastify-cors";

const prisma = new PrismaClient();

enum gender {
  M,
  F,
}

const request = Type.Object({
  query: Type.String(),
});

const select = Type.Object({
  temp_process: Type.Number(),
  resultados_qtd: Type.Number(),
  query: Type.String(),
  resultados: Type.Array(Type.Any()),
});

type SelectType = Static<typeof select>;
type RequestType = Static<typeof request>;

const server = fastify();

//caso queira a documentacao do swagger obs: ela fica no :8080/docs
//a linha de baixo ficaria server.register(swagger,{.....})
//tive que fazer isso para evitar que o cors me barrasse na hora de testar a api
server.register(swagger, {
  swagger: {
    info: {
      title: "BdProject",
      version: "0.0.1",
    },
    tags: [{ name: "Selects", description: "..." }],
  },
  routePrefix: "/docs",
  exposeRoute: true,
});

server.register(require("fastify-cors"), {
  swagger: {
    info: {
      title: "BdProject",
      version: "0.0.1",
    },
    tags: [{ name: "Selects", description: "..." }],
  },
  routePrefix: "/docs",
  exposeRoute: true,
});

server.post<{ Reply: SelectType; Request: RequestType }>(
  "/Selects",
  {
    schema: {
      tags: ["Selects"],
      body: request,
      response: {
        200: select,
      },
    },
  },

  async (request, reply) => {
    const req = JSON.parse(JSON.stringify(request.body));
    const timeStart = Date.now();
    const result = await prisma.$queryRawUnsafe(req.query);

    const dbTime_process = Date.now() - timeStart;
    const queryString = "" + req.query;

    const teste: SelectType = {
      temp_process: dbTime_process,
      resultados_qtd: 0,
      query: queryString,
      resultados: result as any[],
    };

    teste.resultados_qtd = teste.resultados.length;

    return reply.status(200).send(teste);
  }
);

/*
server.post<{ Body: EmployeeType; Reply: EmployeeType }>(
  "/test",
  {
    schema: {
      tags: ["Selects"],
      body: Employee,
      response: {
        200: Employee,
      },
    },
  },

  async (request, reply) => {
    const { body: Employee } = request;

    console.log("user");

    return reply.status(200).send({
      emp_no: 10,
      birth_date: "10/10/2021",
    });
  }
);*/

server.listen(8080, "0.0.0.0", (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
