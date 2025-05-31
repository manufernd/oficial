import mysql.connector

def conectar():
    try:
        conexao = mysql.connector.connect(
            host='mainline.proxy.rlwy.net',
            user='root',
            password='ZfVssLezDFijBMLUDSvSEBYYVSdlUIBv',
            database='railway',
            port=41330
        )
        print('✅ Conectado ao banco')
        return conexao
    except mysql.connector.Error as erro:
        print(f'❌ Erro na conexão: {erro}')
        return None
