import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { Bcrypt } from "../../auth/bcrypt/bcrypt";
import { Usuario } from "../entities/usuario.entity";

@Injectable()
export class UsuarioService{
    constructor(
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
        private bcrypt: Bcrypt
    ){}

    async findAll(): Promise<Usuario[]> {
        return await this.usuarioRepository.find({
            relations:{
                postagem: true
            }
        });
    }

    async findById(id: number): Promise<Usuario> {

        let postagem = await this.usuarioRepository.findOne({
            where: {
                id
            },
            relations:{
                postagem: true
            }
        });

        if (!postagem)
            throw new HttpException('Postagem não encontrada!', HttpStatus.NOT_FOUND);

        return postagem;
    }

    async findByUsuario(usuario: string): Promise<Usuario | undefined> {
        return await this.usuarioRepository.findOne({
            where:{
                usuario: usuario
            },
            relations:{
                postagem: true
            }
        })
    }

    async create(usuario: Usuario): Promise<Usuario> {

        let buscaUsuario = await this.findByUsuario(usuario.usuario)

        if (!buscaUsuario){
            usuario.senha = await this.bcrypt.criptografarSenha(usuario.senha)
            return this.usuarioRepository.save(usuario)
        }

        throw new HttpException("O Usuário (e-mail) já existe!", HttpStatus.BAD_REQUEST)

    }

    async update(usuario: Usuario): Promise<Usuario> {
        
        let updateUsuario = await this.findById(usuario.id)
        let buscaUsuario = await this.findByUsuario(usuario.usuario)

        if (!updateUsuario)
            throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND)
        
        if(buscaUsuario && buscaUsuario.id !== usuario.id)
            throw new HttpException('O Usuário (e-mail) já existe', HttpStatus.BAD_REQUEST)

        usuario.senha = await this.bcrypt.criptografarSenha(usuario.senha)
        
        return this.usuarioRepository.save(usuario)
    
    }
    
    async delete(id: number): Promise<DeleteResult> {
        
        let buscaUsuario = await this.findById(id);

        if (!buscaUsuario)
            throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);

        return this.usuarioRepository.delete(id);

    }

}