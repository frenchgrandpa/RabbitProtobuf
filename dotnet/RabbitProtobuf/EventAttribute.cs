﻿using System;
using JetBrains.Annotations;


namespace RabbitProtobuf {

    [MeansImplicitUse(ImplicitUseKindFlags.Access, ImplicitUseTargetFlags.Itself)]
    [AttributeUsage(AttributeTargets.Method, Inherited = false)]
    public class EventAttribute : Attribute { }

}