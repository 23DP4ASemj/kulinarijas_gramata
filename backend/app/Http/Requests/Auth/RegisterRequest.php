<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vārds ir obligāts.',
            'email.required' => 'E-pasts ir obligāts.',
            'email.email' => 'Ievadiet korektu e-pasta adresi.',
            'email.unique' => 'Lietotājs ar šo e-pastu jau eksistē.',
            'password.required' => 'Parole ir obligāta.',
            'password.min' => 'Parolei jābūt vismaz 6 rakstzīmēm.',
            'password.confirmed' => 'Paroles nesakrīt.',
        ];
    }
}
