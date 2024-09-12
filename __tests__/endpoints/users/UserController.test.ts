import request from "supertest";
import { App } from "../../../src/app";
import { IUser } from "../../../src/interfaces/IUser";
import { IUserResponse } from "../../../src/interfaces/IUserResponse";
import { UserRepository } from "../../../src/endpoints/users/userRepository";

// Cria uma instância da aplicação para executar os testes
const app = new App().server.listen(8081);

describe("UserController", () => {
  afterAll((done) => {
    // Fechar o servidor após os testes
    app.close(done);
  });

  describe("Testes de Sucesso", () => {
    it("Deve retornar a lista de usuários corretamente", async () => {
      const mockUsers: IUser[] = [
        { id: 1, name: "Naruto", age: 10 },
        { id: 2, name: "Sasuke", age: 18 },
        { id: 3, name: "Kakashi", age: 50 },
      ];

      const expectedUsers: IUserResponse[] = [
        { id: 1, name: "Naruto", age: 10, isOfAge: false },
        { id: 2, name: "Sasuke", age: 18, isOfAge: true },
        { id: 3, name: "Kakashi", age: 50, isOfAge: true },
      ];

      jest
        .spyOn(UserRepository.prototype, "list")
        .mockReturnValueOnce(mockUsers);

      const response = await request(app).get("/users");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expectedUsers);
    });

    it("Deve retornar um usuário corretamente", async () => {
      const mockUser: IUser = { id: 1, name: "Naruto", age: 10 };

      const expectedUser: IUserResponse = {
        id: 1,
        name: "Naruto",
        age: 10,
        isOfAge: false,
      };

      jest
        .spyOn(UserRepository.prototype, "findOne")
        .mockReturnValueOnce(mockUser);

      const response = await request(app).get("/users/1");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expectedUser);
    });

    it("Deve criar usuário com sucesso", async () => {
      const newUser: IUser = { id: 4, name: "Sakura", age: 16 };

      jest.spyOn(UserRepository.prototype, "save").mockReturnValueOnce(true);

      const response = await request(app).post("/users").send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe("Usuário criado com sucesso");
    });

    it("Deve excluir um usuário com sucesso", async () => {
      jest.spyOn(UserRepository.prototype, "delete").mockReturnValueOnce(true);

      const response = await request(app).delete("/users/1");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe("Usuário excluído com sucesso");
    });
  });

  describe("Testes de Falha", () => {
    it("Deve retornar erro ao tentar obter um usuário inexistente", async () => {
      jest
        .spyOn(UserRepository.prototype, "findOne")
        .mockReturnValueOnce(undefined);

      const response = await request(app).get("/users/999");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe("Usuário não encontrado");
    });

    it("Deve retornar erro ao tentar criar um usuário com dados inválidos", async () => {
      const invalidUser = { name: "", age: -5 };

      jest.spyOn(UserRepository.prototype, "save").mockReturnValueOnce(false);

      const response = await request(app).post("/users").send(invalidUser);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe("Falha ao criar o usuário");
    });

    it("Deve retornar erro ao tentar excluir um usuário que não existe", async () => {
      jest.spyOn(UserRepository.prototype, "delete").mockReturnValueOnce(false);

      const response = await request(app).delete("/users/999");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe("Falha ao remover o usuário");
    });
  });
});
