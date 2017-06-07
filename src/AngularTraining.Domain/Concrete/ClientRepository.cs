using AngularTraining.Domain.Abstract;
using AngularTraining.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace AngularTraining.Domain.Concrete
{
    public class ClientRepository : RepositoryBase<Client>, IClientRepository
    {
        public ClientRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }
    }
}
