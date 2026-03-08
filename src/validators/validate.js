function validate(schema, target = 'body') {
    return (req, res, next) => {
        const data = req[target]; // nody , query , params , etc

        // paso 1: validar que exista datos
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                msg: `El ${target} no puede estar vacio`
            });
        }
        // paso2: validar contra el schema con opciones
        const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });

        // paso 3 si hay errores de validacion , devolver 400 con mensajes claros

        if (error) {
            return res.status(400).json({
                message: `error de validacion en ${target}`,
                errors: error.details.map((err) => err.message),
            })
        }

        // paso 4 reemplazar el objeto oribial conlos datos validados y limpios
        req[target] = value;
        next();

    };
}

export default validate