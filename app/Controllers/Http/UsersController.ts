// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from "App/Models/User";

export default class UsersController {

   /*
   @author: Mohammad Roffi Suhendry
   @title: Software Engineer
   */
   public async index({ auth, request, response }) {
      try {
         await auth.use('api').authenticate()
         if (!auth.use('api').isAuthenticated)
            return response.badRequest({ success: false, code: 400, message: 'Mohon login terlebih dahulu.' })

         const returns = {
            success: true,
            total: 0,
            hasMore: false,
            data: {}
         }
         const user = new User;
         const searchables = user.getSearchable()
         const page = request.input('page', 1)
         const per_page = request.input('perPage', 10)
         const keyword = request.input('keyword')
         const filters = typeof request.input('filters') !== 'undefined' ? JSON.parse(request.input('filters')) : null
         const date_filters = typeof request.input('dateFilters') !== 'undefined' ? JSON.parse(request.input('dateFilters')) : null
         const sort = request.input('sort', 'asc');
         const sort_by = request.input('sortBy', 'created_at');

         var userQ = User.query().select('*')
         if (filters !== null) {
            for (const key in filters) {
               const value = filters[key]
               if (Array.isArray(value))
                  userQ.whereIn(key, value)
               else
                  userQ.where(key, value)
            }
         }

         if (keyword) {
            userQ.where((query) => {
               for (const src of searchables)
                  query.orWhere(src, 'ILIKE', `%${keyword}%`)
            })
         }

         if (date_filters !== null) {
            for (const key in date_filters) {
               const date = date_filters[key]
               if (date?.start && date?.end)
                  userQ.whereBetween(key, [date?.start, date?.end])
            }
         }

         const users = await userQ
            .debug(true)
            .orderBy(sort_by, sort)
            .paginate(page, per_page)
         const usersJson = users.toJSON()

         returns.hasMore = users.hasMorePages
         returns.total = usersJson.meta.total
         returns.data = usersJson.data

         response.send(returns)
      } catch (error) {
         response.badRequest({ sucess: false, code: 400, message: error?.responseText || error?.code })
      }
   }

   /*
   @author: Mohammad Roffi Suhendry
   @title: Software Engineer
   */
   public async show({ auth, response, params }) {
      try {
         await auth.use('api').authenticate()
         if (!auth.use('api').isAuthenticated)
            return response.badRequest({ success: false, code: 400, message: 'Mohon login terlebih dahulu.' })

         const id = params.id
         const user = await User.findBy('uuid', id)
         if (user === null)
            return response.badRequest({ success: false, code: 400, message: `User ID #${id} tidak ditemukan.` })

         response.send({ success: true, code: 200, data: user })
      }
      catch (error) {
         console.log(error)
         response.badRequest({ success: false, code: 400, message: error?.responseText || error?.code })
      }
   }
}
