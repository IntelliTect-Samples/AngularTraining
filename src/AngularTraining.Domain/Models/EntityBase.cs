using System;
using System.Collections.Generic;
using System.Text;
using AngularTraining.Domain.Abstract;

namespace AngularTraining.Domain.Models
{
    public class EntityBase : IEntity
    {
        public int Id { get; set; }
    }
}
