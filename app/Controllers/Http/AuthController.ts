import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Hash from '@ioc:Adonis/Core/Hash'
import Env from '@ioc:Adonis/Core/Env'

export default class AuthController {

    /*
    @author: Mohammad Roffi Suhendry
    @title: Software Engineer
    */
    public async register({ request, response }: HttpContextContract) {
        const user = new User()
        const header = request.headers()
        if(
            typeof header["x-api-key"] == 'undefined' || 
            (
                typeof header["x-api-key"] !== 'undefined' && 
                header["x-api-key"] != Env.get('API_KEY')
            )
        )
        {
            return response.badRequest({ success: false, code: 401, message: 'Unautorized. Please enter valid api key!'})
        }

        const newPostSchema = schema.create({
            email: schema.string({}, [
                rules.email(),
                rules.unique({ table: 'users', column: 'email' })
            ]),
            name: schema.string(),
            password: schema.string({}, [
                rules.confirmed(),
                rules.minLength(4)
            ]),
        })
        try {
            const payload = await request.validate({ 
                schema: newPostSchema,
                messages: {
                    required: 'Field {{ field }} wajib diisi',
                    'email.unique': 'Email sudah ada didatabase!',
                    'password_confirmation.confirmed': 'Password tidak sama!',
                    minLength: 'Minimal {{ options.minLength }} karakter'
                }
            })
            user.name = payload.name
            user.email = payload.email
            user.password = payload.password
            await user.save()

            const newUser = await User.find(user.id)

            const return_response = {
                success: true,
                code: 200,
                data: newUser,
                message: `User ${newUser?.name} berhasil didaftarkan`
            }
            response.status(return_response.code).send(return_response)
        } catch (error) {
            console.log(error)
            response.badRequest({code: 400, ...error.messages})
        }
    }

    /*
    @author: Mohammad Roffi Suhendry
    @title: Software Engineer
    */
    public async login({ auth, request, response }){
        const header = request.headers()
        if(
            typeof header["x-api-key"] == 'undefined' || 
            (
                typeof header["x-api-key"] !== 'undefined' && 
                header["x-api-key"] != Env.get('API_KEY')
            )
        )
        {
            return response.badRequest({ success: false, code: 401, message: 'Unautorized. Please enter valid api key!'})
        }

        const email = request.input('email')
        const password = request.input('password')
      
        // Lookup user manually
        const user = await User
                            .query()
                            .where('email', email)
                            .first()

        // console.log(user)
        // return 
      
        if(user === null)
            return response.badRequest({ success: false, code: 400, error: `Email ${email} tidak ada didatabase` })
        // Verify password
        if (!(await Hash.verify(user.password, password))) {
            return response.badRequest({ success: false, code: 400, error: 'Email atau password salah' })
        }
      
        // Generate token
        const token = await auth.use('api').generate(user, {
            expiresIn: '7days'
        })
        // response.send({ code: 200, ...token})
        response.send(token)
    }

    /*
    @author: Mohammad Roffi Suhendry
    @title: Software Engineer
    */
    public async logout({ auth, response }){
        await auth.use('api').authenticate()
        if(auth.use('api').isAuthenticated)
        {
            await auth.use('api').revoke()
            response.send({
                revoked: true,
                message: 'Logout berhasil!'
            })
        }
    }
}
