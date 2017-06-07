using System;
using System.Collections.Generic;
using System.Text;

namespace AngularTraining.Domain.Models
{
    public class Project : EntityBase
    {
        public string Title { get; set; }
        public Client Client { get; set; }
        public int ClientId { get; set; }
    }
}
