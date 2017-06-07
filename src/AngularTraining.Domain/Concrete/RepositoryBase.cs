using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using AngularTraining.Domain.Abstract;

namespace AngularTraining.Domain.Concrete
{
    public class RepositoryBase<T> : IRepository<T> where T : class, IEntity
    {
        public ApplicationDbContext DbContext { get; }
        private DbSet<T> DbSet;

        public RepositoryBase(ApplicationDbContext dbContext)
        {
            DbContext = dbContext;
            DbSet = dbContext.Set<T>();
        }

        public IQueryable<T> All
        {
            get
            {
                return DbSet.AsQueryable();
            }
        }

        public IQueryable<T> AllIncluding(params Expression<Func<T, object>>[] includeProperties)
        {
            IQueryable<T> query = DbSet.AsQueryable();
            foreach (var includeProperty in includeProperties)
            {
                query = query.Include(includeProperty);
            }
            return query;
        }

        public async Task<T> FindAsync(int id)
        {
            return await DbSet.FindAsync(id);
        }

        public void InsertOrUpdate(T entity)
        {
            if (entity.Id == default(int))
            {
                DbSet.Add(entity);
            }
            else
            {
                DbSet.Update(entity);
            }
        }

        public async void Delete(int id)
        {
            T entity = await FindAsync(id);
            DbSet.Remove(entity);
        }

        public async Task<int> SaveAsync()
        {
            return await DbContext.SaveChangesAsync();
        }
    }
}
